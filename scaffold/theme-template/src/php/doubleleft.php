<?php

/**
 * * Name: doubleleft
 *   * Description: __THEME_SLUG_PASCAL__ doubleleft, same as default
 *   * Version: 0.1-beta
 *   * ContentRegion: aside, right_aside_wrapper
 *   * ContentRegion: right_aside, left_aside_wrapper
 *   * ContentRegion: content, region_2
 */

require_once __DIR__ . '/manifest.php';
$__THEME_SLUG___assets = __THEME_SLUG___assets();
$__THEME_SLUG___favicon = get_config('system', 'sitelogo_favicon') ?: '/view/theme/__THEME_SLUG__/assets/favicon.ico';
$__THEME_SLUG___touch_icon = get_config('system', 'sitelogo_192') ?: '/view/theme/__THEME_SLUG__/assets/apple-touch-icon-180x180.png';
?>

<!DOCTYPE html>
<html lang="en">
<head>
	<title><?php if (x($page, 'title')) echo $page['title'] ?></title>
	<script>
    var baseurl = "<?php echo z_root() ?>";
  </script>
  <?php foreach ($__THEME_SLUG___assets['css'] as $__THEME_SLUG___css): ?>
  <link rel="stylesheet" href="<?php echo $__THEME_SLUG___css ?>">
  <?php endforeach; ?>
	<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
	<meta name="format-detection" content="telephone=no">
	<meta name="format-detection" content="date=no">
	<link rel="icon" href="<?php echo $__THEME_SLUG___favicon ?>">
	<link rel="manifest" href="/spa/manifest" />
	<meta name="theme-color" content="#1e293b" />
	<meta name="mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
	<meta name="apple-mobile-web-app-title" content="__THEME_SLUG_PASCAL__" />
	<link rel="apple-touch-icon" href="<?php echo $__THEME_SLUG___touch_icon ?>" />
</head>

<body>

<div id="root"></div>

<script type="module" src="<?php echo $__THEME_SLUG___assets['js'] ?>"></script>
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/spa/sw', { scope: '/', updateViaCache: 'none' })
        .then(function (reg) {
          reg.addEventListener('updatefound', function () {
            var nw = reg.installing;
            nw.addEventListener('statechange', function () {
              if (nw.state === 'installed' && navigator.serviceWorker.controller) {
                window.dispatchEvent(new CustomEvent('pwa-update-available'));
              }
            });
          });
          var checkForUpdate = function () { reg.update().catch(function () {}); };
          setInterval(checkForUpdate, 60 * 60 * 1000);
          document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'visible') checkForUpdate();
          });
        })
        .catch(function (err) {
          console.warn('[PWA] SW registration failed:', err);
        });
    });
  }
</script>
</body>
</html>
