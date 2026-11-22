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
 * Posts each signup as JSON to the address set in Settings, signed with HMAC-SHA256.
 */
class Webhook
{
    public static function send(array $popup, array $lead, array $coupon, $url = null)
    {
        $url = $url !== null ? $url : (string) \Configuration::get('POPUPSTUDIO_WEBHOOK_URL');
        if ($url === '' || !preg_match('#^https?://#i', $url)) {
            return null;
        }
        $body = json_encode([
            'event' => 'signup',
            'popup' => ['id' => (int) $popup['id'], 'name' => (string) $popup['name']],
            'variant' => (int) (isset($lead['id_variant']) ? $lead['id_variant'] : 0),
            'email' => (string) (isset($lead['email']) ? $lead['email'] : ''),
            'firstname' => (string) (isset($lead['firstname']) ? $lead['firstname'] : ''),
            'phone' => (string) (isset($lead['phone']) ? $lead['phone'] : ''),
            'consent' => (bool) (isset($lead['consent']) ? $lead['consent'] : false),
            'coupon' => (string) (isset($coupon['code']) ? $coupon['code'] : ''),
            'language' => (string) \Context::getContext()->language->iso_code,
            'shop' => (string) \Configuration::get('PS_SHOP_NAME'),
            'date' => date('c'),
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $secret = (string) \Configuration::get('POPUPSTUDIO_WEBHOOK_SECRET');
        $headers = ['Content-Type: application/json', 'User-Agent: PopupStudio/1.0'];
        if ($secret !== '') {
            $headers[] = 'X-PopupStudio-Signature: sha256=' . hash_hmac('sha256', $body, $secret);
        }
        $start = microtime(true);
        $code = 0;
        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => $body,
                CURLOPT_HTTPHEADER => $headers,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 4,
                CURLOPT_CONNECTTIMEOUT => 3,
                CURLOPT_FOLLOWLOCATION => false,
            ]);
            curl_exec($ch);
            $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
        }
        $ms = (int) round((microtime(true) - $start) * 1000);
        \Configuration::updateValue('POPUPSTUDIO_WEBHOOK_LAST', json_encode(['date' => date('Y-m-d H:i:s'), 'code' => $code, 'ms' => $ms]));

        return ['code' => $code, 'ms' => $ms];
    }
}
