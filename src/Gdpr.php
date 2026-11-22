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

/**
 * Consent text from the Official GDPR module (psgdpr) when present, plus export and erasure of leads.
 */
class Gdpr
{
    public static function available()
    {
        if (!\Module::isEnabled('psgdpr')) {
            return false;
        }
        \Module::getInstanceByName('psgdpr');

        return class_exists('GDPRConsent');
    }

    public static function consentMessage($idModule, $idLang)
    {
        if (!self::available()) {
            return '';
        }
        try {
            $msg = \GDPRConsent::getConsentMessage((int) $idModule, (int) $idLang);
            $active = \GDPRConsent::getConsentActive((int) $idModule);
        } catch (\Exception $e) {
            return '';
        }

        return $active && is_string($msg) ? trim(strip_tags($msg, '<a><b><strong><em><i>')) : '';
    }

    public static function log($idModule, $idCustomer, $idGuest)
    {
        if (!self::available() || !class_exists('GDPRLog')) {
            return;
        }
        try {
            \GDPRLog::addLog((int) $idCustomer, 'consent', (int) $idModule, (int) $idGuest);
        } catch (\Exception $e) {
            // The GDPR module is optional; our own lead row keeps the consent record.
        }
    }

    public static function delete($email)
    {
        \Db::getInstance()->delete('popupstudio_feedback', 'email = "' . pSQL($email) . '"');

        return \Db::getInstance()->delete('popupstudio_lead', 'email = "' . pSQL($email) . '"');
    }

    public static function export($email)
    {
        $rows = \Db::getInstance()->executeS('SELECT email, firstname, phone, coupon, newsletter, consent, consent_text, ip, date_add
            FROM `' . _DB_PREFIX_ . 'popupstudio_lead` WHERE email = "' . pSQL($email) . '"') ?: [];
        $fb = \Db::getInstance()->executeS('SELECT email, question, rating, message, page, date_add
            FROM `' . _DB_PREFIX_ . 'popupstudio_feedback` WHERE email = "' . pSQL($email) . '"') ?: [];
        foreach ($fb as $f) {
            $rows[] = $f;
        }

        return $rows;
    }
}
