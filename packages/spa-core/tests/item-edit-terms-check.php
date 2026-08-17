<?php
/**
 * Check: editing a post through /spa/item/:mid/edit must not destroy terms
 * it wasn't asked to change. One case per invocation — Response::send()
 * calls killme(), so the handler can only be driven once per process.
 *
 * Deliberately NOT under php/ — that whole directory is copied into the
 * deployed theme (web root) at build time, and this file fakes a session.
 * Copy it to the ddev project root to run:
 *
 *   cp packages/spa-core/tests/item-edit-terms-check.php ../hz-ddev/
 *   cd ../hz-ddev
 *   U=$(ddev exec php /var/www/html/item-edit-terms-check.php setup | tail -1)
 *   ddev exec php /var/www/html/item-edit-terms-check.php dump       $U  # 3:alpha | 3:beta | 5:myfolder
 *   ddev exec php /var/www/html/item-edit-terms-check.php edit-nocat $U
 *   ddev exec php /var/www/html/item-edit-terms-check.php dump       $U  # 1:tagtwo | 3:alpha | 3:beta | 5:myfolder
 *   ddev exec php /var/www/html/item-edit-terms-check.php edit-cats  $U
 *   ddev exec php /var/www/html/item-edit-terms-check.php dump       $U  # 1:tagtwo | 3:alpha | 3:gamma | 5:myfolder
 *   ddev exec php /var/www/html/item-edit-terms-check.php edit-clear $U
 *   ddev exec php /var/www/html/item-edit-terms-check.php dump       $U  # 1:tagtwo | 5:myfolder
 *   ddev exec php /var/www/html/item-edit-terms-check.php cleanup    $U
 *
 * ttypes: 1 = hashtag, 3 = category, 5 = filed folder.
 */

chdir('/var/www/html/core');
require_once('include/cli_startup.php');
cli_startup();

$case = $argv[1] ?? '';
$arg  = $argv[2] ?? '';

$c = q("SELECT * FROM channel WHERE channel_removed = 0 ORDER BY channel_id LIMIT 1");
if (!$c) { fwrite(STDERR, "no channel\n"); exit(1); }
$channel = $c[0];
$uid     = intval($channel['channel_id']);

// ── Session emulation so local_channel()/CSRF behave as they do over HTTP ──
@session_start();
$_SESSION['authenticated']    = 1;
$_SESSION['uid']              = $uid;
$_SESSION['solidified_csrf']  = 'testtoken';
$_SERVER['HTTP_X_CSRF_TOKEN'] = 'testtoken';
// Form content-type makes Auth::parseJsonBody() read $_POST, which a CLI
// script can populate — php://input is empty here.
$_SERVER['CONTENT_TYPE'] = 'application/x-www-form-urlencoded';

App::$channel = $channel;
$x = q("SELECT * FROM xchan WHERE xchan_hash = '%s' LIMIT 1", dbesc($channel['channel_hash']));
App::$observer = $x ? $x[0] : null;

$base = '/var/www/html/core/extend/theme/utsukta-themes/solidified/spa-core/Api/';
require_once($base . 'Response.php');
require_once($base . 'Auth.php');
require_once($base . 'Handlers/Csrf.php');
foreach (glob($base . 'Concerns/*.php') as $trait) require_once($trait);
require_once($base . 'Handlers/Item.php');

function cats(string $uuid): array {
    $r = q("SELECT t.ttype, t.term FROM term t JOIN item i ON i.id = t.oid
            WHERE i.uuid = '%s' AND t.otype = %d ORDER BY t.ttype, t.term", dbesc($uuid), intval(TERM_OBJ_POST));
    $out = [];
    foreach ($r ?: [] as $row) $out[] = $row['ttype'] . ':' . $row['term'];
    return $out;
}

function drive(string $uuid, array $post): void {
    global $_POST;
    $_POST = $post;
    $h = new \Utsukta\SpaCore\Api\Handlers\Item();
    $m = new ReflectionMethod($h, 'editItem');
    $m->setAccessible(true);
    $m->invoke($h, $uuid);   // dies via json_return_and_die
}

switch ($case) {

case 'setup':
    $uuid = item_message_id();
    $mid  = z_root() . '/item/' . $uuid;
    $now  = datetime_convert();
    $arr = [
        'aid' => $channel['channel_account_id'], 'uid' => $uid, 'uuid' => $uuid,
        'mid' => $mid, 'parent_mid' => $mid, 'thr_parent' => $mid, 'plink' => $mid,
        'owner_xchan' => $channel['channel_hash'], 'author_xchan' => $channel['channel_hash'],
        'created' => $now, 'edited' => $now, 'commented' => $now, 'received' => $now, 'changed' => $now,
        'verb' => 'Create', 'obj_type' => 'Note', 'mimetype' => 'text/bbcode',
        'title' => 'edit check', 'body' => 'original body #tagone',
        'item_wall' => 1, 'item_origin' => 1, 'item_thread_top' => 1, 'item_private' => 0,
        'allow_cid' => '', 'allow_gid' => '', 'deny_cid' => '', 'deny_gid' => '',
        'term' => [
            ['uid' => $uid, 'ttype' => TERM_CATEGORY, 'otype' => TERM_OBJ_POST,
             'term' => 'alpha', 'url' => channel_url($channel) . '?cat=alpha'],
            ['uid' => $uid, 'ttype' => TERM_CATEGORY, 'otype' => TERM_OBJ_POST,
             'term' => 'beta',  'url' => channel_url($channel) . '?cat=beta'],
        ],
    ];
    $post = item_store($arr, false, false, false);
    if (empty($post['success'])) { fwrite(STDERR, "item_store failed\n"); exit(1); }
    // A filed-folder term, as "save to folder" would leave behind.
    store_item_tag($uid, intval($post['item_id']), TERM_OBJ_POST, TERM_FILE, 'myfolder', '');
    echo $uuid . "\n";
    break;

case 'edit-nocat':   // inline comment editor: no category key at all
    drive($arg, ['body' => 'edited body #tagtwo']);
    break;

case 'edit-cats':    // composer: categories changed
    drive($arg, ['body' => 'edited body #tagtwo', 'category' => 'alpha,gamma']);
    break;

case 'edit-clear':   // composer: every category removed
    drive($arg, ['body' => 'edited body #tagtwo', 'category' => '']);
    break;

case 'dump':
    echo implode(' | ', cats($arg)) . "\n";
    break;

case 'cleanup':
    $r = q("SELECT id FROM item WHERE uuid = '%s'", dbesc($arg));
    if ($r) {
        q("DELETE FROM term WHERE oid = %d AND otype = %d", intval($r[0]['id']), intval(TERM_OBJ_POST));
        q("DELETE FROM item WHERE id = %d", intval($r[0]['id']));
    }
    echo "cleaned\n";
    break;

default:
    fwrite(STDERR, "unknown case\n"); exit(1);
}
