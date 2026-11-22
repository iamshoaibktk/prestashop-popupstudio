<?php
/**
 * Popup Studio
 *
 * @author    iamshoaibktk@gmail.com (WhatsApp: +923459016286)
 * @license   https://opensource.org/licenses/AFL-3.0 Academic Free License 3.0 (AFL-3.0)
 */

namespace Iamshoaibktk\Popupstudio;

if (!defined('_PS_VERSION_')) {
    exit;
}

class Installer
{
    const HOOKS = [
        'actionFrontControllerSetMedia',
        'displayBeforeBodyClosingTag',
        'displayPopupStudio',
        'actionValidateOrder',
        'registerGDPRConsent',
        'actionDeleteGDPRCustomer',
        'actionExportGDPRData',
    ];

    const CONFIG = [
        'POPUPSTUDIO_MAX_PER_VISIT' => 2,
        'POPUPSTUDIO_MAX_AT_ONCE' => 1,
        'POPUPSTUDIO_COUNT_BARS' => 0,
        'POPUPSTUDIO_HIDE_BOTS' => 1,
        'POPUPSTUDIO_IP_EXCLUDE' => '',
        'POPUPSTUDIO_CONSENT_LOG' => 1,
        'POPUPSTUDIO_COUPON_LEN' => 8,
        'POPUPSTUDIO_COUPON_CLEANUP' => 1,
        'POPUPSTUDIO_WEBHOOK_URL' => '',
        'POPUPSTUDIO_WEBHOOK_SECRET' => '',
        'POPUPSTUDIO_WEBHOOK_LAST' => '',
        'POPUPSTUDIO_LAZY' => 1,
        'POPUPSTUDIO_REDUCED_MOTION' => 1,
        'POPUPSTUDIO_STATS_MONTHS' => 13,
        'POPUPSTUDIO_KEEP_DATA' => 0,
        'POPUPSTUDIO_ATTRIB_DAYS' => 7,
    ];

    public static function install(\Module $module)
    {
        foreach (self::sql() as $q) {
            if (!\Db::getInstance()->execute($q)) {
                return false;
            }
        }
        foreach (self::CONFIG as $k => $v) {
            \Configuration::updateGlobalValue($k, $v);
        }
        \Configuration::updateGlobalValue('POPUPSTUDIO_SECRET', \Tools::passwdGen(40));

        return self::installTab($module);
    }

    public static function uninstall(\Module $module)
    {
        $tabId = (int) \Tab::getIdFromClassName('AdminPopupStudio');
        if ($tabId) {
            $tab = new \Tab($tabId);
            $tab->delete();
        }
        if (!\Configuration::get('POPUPSTUDIO_KEEP_DATA')) {
            foreach (['popup', 'popup_shop', 'variant', 'stat', 'lead', 'answer', 'prize', 'play', 'feedback'] as $t) {
                \Db::getInstance()->execute('DROP TABLE IF EXISTS `' . _DB_PREFIX_ . 'popupstudio_' . $t . '`');
            }
            foreach (array_keys(self::CONFIG) as $k) {
                \Configuration::deleteByName($k);
            }
            \Configuration::deleteByName('POPUPSTUDIO_SECRET');
        }

        return true;
    }

    private static function installTab(\Module $module)
    {
        if (\Tab::getIdFromClassName('AdminPopupStudio')) {
            return true;
        }
        $tab = new \Tab();
        $tab->class_name = 'AdminPopupStudio';
        $tab->module = $module->name;
        $tab->active = 1;
        $tab->id_parent = (int) \Tab::getIdFromClassName('Marketing');
        if (!$tab->id_parent) {
            $tab->id_parent = (int) \Tab::getIdFromClassName('AdminParentCustomer');
        }
        if (!$tab->id_parent) {
            $tab->id_parent = (int) \Tab::getIdFromClassName('IMPROVE');
        }
        foreach (\Language::getLanguages(false) as $lang) {
            $tab->name[(int) $lang['id_lang']] = 'Popup Studio';
        }

        return (bool) $tab->add();
    }

    private static function sql()
    {
        $p = _DB_PREFIX_ . 'popupstudio_';
        $e = ' ENGINE=' . _MYSQL_ENGINE_ . ' DEFAULT CHARSET=utf8mb4';

        return [
            'CREATE TABLE IF NOT EXISTS `' . $p . 'popup` (
                `id_popup` INT UNSIGNED NOT NULL AUTO_INCREMENT,
                `name` VARCHAR(128) NOT NULL,
                `status` VARCHAR(12) NOT NULL DEFAULT "draft",
                `template` VARCHAR(64) NOT NULL DEFAULT "",
                `priority` INT NOT NULL DEFAULT 0,
                `date_start` DATETIME NULL,
                `date_end` DATETIME NULL,
                `settings` LONGTEXT NULL,
                `ab_active` TINYINT(1) NOT NULL DEFAULT 0,
                `position` INT NOT NULL DEFAULT 0,
                `date_add` DATETIME NOT NULL,
                `date_upd` DATETIME NOT NULL,
                PRIMARY KEY (`id_popup`), KEY `status` (`status`)
            )' . $e,
            'CREATE TABLE IF NOT EXISTS `' . $p . 'popup_shop` (
                `id_popup` INT UNSIGNED NOT NULL,
                `id_shop` INT UNSIGNED NOT NULL,
                PRIMARY KEY (`id_popup`, `id_shop`)
            )' . $e,
            'CREATE TABLE IF NOT EXISTS `' . $p . 'variant` (
                `id_variant` INT UNSIGNED NOT NULL AUTO_INCREMENT,
                `id_popup` INT UNSIGNED NOT NULL,
                `label` VARCHAR(64) NOT NULL DEFAULT "A",
                `weight` INT NOT NULL DEFAULT 50,
                `content` LONGTEXT NULL,
                `active` TINYINT(1) NOT NULL DEFAULT 1,
                `position` INT NOT NULL DEFAULT 0,
                PRIMARY KEY (`id_variant`), KEY `id_popup` (`id_popup`)
            )' . $e,
            'CREATE TABLE IF NOT EXISTS `' . $p . 'stat` (
                `id_popup` INT UNSIGNED NOT NULL,
                `id_variant` INT UNSIGNED NOT NULL,
                `day` DATE NOT NULL,
                `device` TINYINT UNSIGNED NOT NULL DEFAULT 0,
                `views` INT UNSIGNED NOT NULL DEFAULT 0,
                `closes` INT UNSIGNED NOT NULL DEFAULT 0,
                `clicks` INT UNSIGNED NOT NULL DEFAULT 0,
                `signups` INT UNSIGNED NOT NULL DEFAULT 0,
                `orders` INT UNSIGNED NOT NULL DEFAULT 0,
                `revenue` DECIMAL(20,6) NOT NULL DEFAULT 0,
                PRIMARY KEY (`id_popup`, `id_variant`, `day`, `device`), KEY `day` (`day`)
            )' . $e,
            'CREATE TABLE IF NOT EXISTS `' . $p . 'lead` (
                `id_lead` INT UNSIGNED NOT NULL AUTO_INCREMENT,
                `id_shop` INT UNSIGNED NOT NULL DEFAULT 1,
                `id_popup` INT UNSIGNED NOT NULL,
                `id_variant` INT UNSIGNED NOT NULL DEFAULT 0,
                `email` VARCHAR(255) NOT NULL,
                `firstname` VARCHAR(128) NOT NULL DEFAULT "",
                `phone` VARCHAR(32) NOT NULL DEFAULT "",
                `id_lang` INT UNSIGNED NOT NULL DEFAULT 0,
                `id_customer` INT UNSIGNED NOT NULL DEFAULT 0,
                `coupon` VARCHAR(64) NOT NULL DEFAULT "",
                `id_cart_rule` INT UNSIGNED NOT NULL DEFAULT 0,
                `coupon_used` TINYINT(1) NOT NULL DEFAULT 0,
                `newsletter` VARCHAR(12) NOT NULL DEFAULT "",
                `consent` TINYINT(1) NOT NULL DEFAULT 0,
                `consent_text` TEXT NULL,
                `ip` VARCHAR(45) NOT NULL DEFAULT "",
                `extra` TEXT NULL,
                `date_add` DATETIME NOT NULL,
                PRIMARY KEY (`id_lead`), KEY `email` (`email`), KEY `id_popup` (`id_popup`), KEY `id_cart_rule` (`id_cart_rule`)
            )' . $e,
            'CREATE TABLE IF NOT EXISTS `' . $p . 'answer` (
                `id_popup` INT UNSIGNED NOT NULL,
                `id_variant` INT UNSIGNED NOT NULL,
                `question` VARCHAR(64) NOT NULL,
                `answer` VARCHAR(64) NOT NULL,
                `count` INT UNSIGNED NOT NULL DEFAULT 0,
                PRIMARY KEY (`id_popup`, `id_variant`, `question`, `answer`)
            )' . $e,
            'CREATE TABLE IF NOT EXISTS `' . $p . 'prize` (
                `id_popup` INT UNSIGNED NOT NULL,
                `prize` VARCHAR(64) NOT NULL,
                `awarded` INT UNSIGNED NOT NULL DEFAULT 0,
                PRIMARY KEY (`id_popup`, `prize`)
            )' . $e,
            'CREATE TABLE IF NOT EXISTS `' . $p . 'play` (
                `id_play` INT UNSIGNED NOT NULL AUTO_INCREMENT,
                `id_popup` INT UNSIGNED NOT NULL,
                `visitor` VARCHAR(64) NOT NULL,
                `ip` VARCHAR(45) NOT NULL DEFAULT "",
                `prize` VARCHAR(64) NOT NULL DEFAULT "",
                `claimed` TINYINT(1) NOT NULL DEFAULT 0,
                `date_add` DATETIME NOT NULL,
                PRIMARY KEY (`id_play`), KEY `visitor` (`id_popup`, `visitor`), KEY `ip` (`id_popup`, `ip`)
            )' . $e,
            'CREATE TABLE IF NOT EXISTS `' . $p . 'feedback` (
                `id_feedback` INT UNSIGNED NOT NULL AUTO_INCREMENT,
                `id_shop` INT UNSIGNED NOT NULL DEFAULT 1,
                `id_popup` INT UNSIGNED NOT NULL,
                `id_variant` INT UNSIGNED NOT NULL DEFAULT 0,
                `question` VARCHAR(64) NOT NULL DEFAULT "",
                `rating` TINYINT UNSIGNED NOT NULL DEFAULT 0,
                `message` TEXT NOT NULL,
                `email` VARCHAR(255) NOT NULL DEFAULT "",
                `id_lang` INT UNSIGNED NOT NULL DEFAULT 0,
                `page` VARCHAR(255) NOT NULL DEFAULT "",
                `ip` VARCHAR(45) NOT NULL DEFAULT "",
                `date_add` DATETIME NOT NULL,
                PRIMARY KEY (`id_feedback`), KEY `id_popup` (`id_popup`), KEY `email` (`email`)
            )' . $e,
        ];
    }
}
