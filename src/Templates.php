<?php
/**
 * Popup Studio
 *
 * @author    iamshoaibktk (https://github.com/iamshoaibktk)
 * @license   https://opensource.org/licenses/AFL-3.0 Academic Free License 3.0 (AFL-3.0)
 */

namespace Iamshoaibktk\Popupstudio;

if (!defined('_PS_VERSION_')) {
    exit;
}

/**
 * The 50 bundled templates: templates/<nn>-<slug>.json (document, settings) and templates/css/<slug>.css.
 */
class Templates
{
    private static function dir(\Module $m)
    {
        return _PS_MODULE_DIR_ . $m->name . '/templates/';
    }

    public static function all(\Module $m)
    {
        $out = [];
        foreach (glob(self::dir($m) . '*.json') ?: [] as $file) {
            $t = Repository::decode((string) file_get_contents($file));
            if (!$t || empty($t['slug'])) {
                continue;
            }
            $out[] = self::withCss($m, $t);
        }
        usort($out, function ($a, $b) {
            return (int) $a['num'] - (int) $b['num'];
        });

        return $out;
    }

    public static function get(\Module $m, $slug)
    {
        $slug = preg_replace('/[^a-z0-9-]/', '', (string) $slug);
        foreach (glob(self::dir($m) . '*-' . $slug . '.json') ?: [] as $file) {
            $t = Repository::decode((string) file_get_contents($file));
            if ($t) {
                return self::withCss($m, $t);
            }
        }

        return null;
    }

    private static function withCss(\Module $m, array $t)
    {
        $css = self::dir($m) . 'css/' . $t['slug'] . '.css';
        if (is_file($css) && isset($t['doc'])) {
            $t['doc']['css'] = (string) file_get_contents($css);
            $t['doc']['cssv'] = substr(md5($t['doc']['css']), 0, 8);
        }

        return $t;
    }
}
