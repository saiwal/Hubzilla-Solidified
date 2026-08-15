<?php

namespace {

  use Zotlabs\Lib\Config;
  use Zotlabs\Extend\Route;

	function __THEME_SLUG___theme_admin_enable() {
		Route::register('view/theme/__THEME_SLUG__/mod/spa.php', 'spa');
		register_hook('enotify_store_end', 'view/theme/__THEME_SLUG__/hooks/webpush.php', '__THEME_SLUG___webpush_send');
  }

  function __THEME_SLUG___theme_admin_disable() {
		Route::unregister('view/theme/__THEME_SLUG__/mod/spa.php', 'spa');
		unregister_hook('enotify_store_end', 'view/theme/__THEME_SLUG__/hooks/webpush.php', '__THEME_SLUG___webpush_send');
  }

  function theme_admin(&$a) {
  }

  function theme_admin_post() {
	}
}
