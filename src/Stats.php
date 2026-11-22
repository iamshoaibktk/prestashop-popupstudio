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
 * Daily counters per popup, variant and device. No personal data is stored here.
 */
class Stats
{
    const EVENTS = ['view' => 'views', 'close' => 'closes', 'click' => 'clicks', 'signup' => 'signups'];
    const DEVICES = ['desktop' => 0, 'tablet' => 1, 'mobile' => 2];

    public static function event($idPopup, $idVariant, $event, $device, $n = 1)
    {
        if (!isset(self::EVENTS[$event])) {
            return false;
        }
        $col = self::EVENTS[$event];

        return self::bump((int) $idPopup, (int) $idVariant, $col, (int) $n, isset(self::DEVICES[$device]) ? self::DEVICES[$device] : 0);
    }

    private static function bump($idPopup, $idVariant, $col, $n, $device, $revenue = 0.0)
    {
        if ($idPopup <= 0) {
            return false;
        }
        $sql = 'INSERT INTO `' . _DB_PREFIX_ . 'popupstudio_stat` (id_popup, id_variant, day, device, `' . $col . '`' . ($revenue ? ', revenue' : '') . ')
            VALUES (' . $idPopup . ', ' . $idVariant . ', "' . date('Y-m-d') . '", ' . $device . ', ' . $n . ($revenue ? ', ' . (float) $revenue : '') . ')
            ON DUPLICATE KEY UPDATE `' . $col . '` = `' . $col . '` + ' . $n . ($revenue ? ', revenue = revenue + ' . (float) $revenue : '');

        return \Db::getInstance()->execute($sql);
    }

    /**
     * Credit an order to a popup: its coupon was used, or the buyer signed up through a popup recently.
     */
    public static function creditOrder($order, $cart)
    {
        $db = \Db::getInstance();
        $amount = (float) $order->total_paid_tax_incl;
        if ((float) $order->conversion_rate > 0) {
            $amount = $amount / (float) $order->conversion_rate;
        }
        $lead = null;
        foreach ((array) $order->getCartRules() as $cr) {
            $row = $db->getRow('SELECT id_lead, id_popup, id_variant FROM `' . _DB_PREFIX_ . 'popupstudio_lead` WHERE id_cart_rule = ' . (int) $cr['id_cart_rule'] . ' ORDER BY id_lead DESC');
            if ($row) {
                $lead = $row;
                $db->update('popupstudio_lead', ['coupon_used' => 1], 'id_lead = ' . (int) $row['id_lead']);
                break;
            }
            $code = (string) $db->getValue('SELECT code FROM `' . _DB_PREFIX_ . 'cart_rule` WHERE id_cart_rule = ' . (int) $cr['id_cart_rule']);
            if ($code !== '') {
                $row = $db->getRow('SELECT id_lead, id_popup, id_variant FROM `' . _DB_PREFIX_ . 'popupstudio_lead` WHERE coupon = "' . pSQL($code) . '" ORDER BY id_lead DESC');
                if ($row) {
                    $lead = $row;
                    break;
                }
            }
        }
        if (!$lead) {
            $customer = new \Customer((int) $order->id_customer);
            $days = max(1, (int) \Configuration::get('POPUPSTUDIO_ATTRIB_DAYS'));
            if ($customer->email) {
                $lead = $db->getRow('SELECT id_lead, id_popup, id_variant FROM `' . _DB_PREFIX_ . 'popupstudio_lead`
                    WHERE email = "' . pSQL($customer->email) . '" AND date_add >= DATE_SUB(NOW(), INTERVAL ' . $days . ' DAY)
                    ORDER BY id_lead DESC') ?: null;
            }
        }
        if ($lead) {
            self::bump((int) $lead['id_popup'], (int) $lead['id_variant'], 'orders', 1, 0, $amount);
        }
    }

    public static function answer($idPopup, $idVariant, $question, $answer)
    {
        $q = \Tools::substr(preg_replace('/[^A-Za-z0-9_-]/', '', (string) $question), 0, 64);
        $a = \Tools::substr(preg_replace('/[^A-Za-z0-9_-]/', '', (string) $answer), 0, 64);
        if ($q === '' || $a === '') {
            return false;
        }

        return \Db::getInstance()->execute('INSERT INTO `' . _DB_PREFIX_ . 'popupstudio_answer` (id_popup, id_variant, question, answer, count)
            VALUES (' . (int) $idPopup . ', ' . (int) $idVariant . ', "' . pSQL($q) . '", "' . pSQL($a) . '", 1)
            ON DUPLICATE KEY UPDATE count = count + 1');
    }

    /**
     * Totals, a daily series, devices and per-popup rows for a date range.
     */
    public static function report($days, $idPopup = 0)
    {
        $db = \Db::getInstance();
        $days = max(1, min(400, (int) $days));
        $from = date('Y-m-d', strtotime('-' . ($days - 1) . ' days'));
        $where = 's.day >= "' . pSQL($from) . '"' . ($idPopup ? ' AND s.id_popup = ' . (int) $idPopup : '');
        $sum = 'SUM(views) views, SUM(closes) closes, SUM(clicks) clicks, SUM(signups) signups, SUM(orders) orders, SUM(revenue) revenue';
        $p = _DB_PREFIX_ . 'popupstudio_';

        $totals = $db->getRow('SELECT ' . $sum . ' FROM `' . $p . 'stat` s WHERE ' . $where) ?: [];
        $prevFrom = date('Y-m-d', strtotime('-' . (2 * $days - 1) . ' days'));
        $prev = $db->getRow('SELECT ' . $sum . ' FROM `' . $p . 'stat` s WHERE s.day >= "' . pSQL($prevFrom) . '" AND s.day < "' . pSQL($from) . '"' . ($idPopup ? ' AND s.id_popup = ' . (int) $idPopup : '')) ?: [];

        $rows = $db->executeS('SELECT s.day, ' . $sum . ' FROM `' . $p . 'stat` s WHERE ' . $where . ' GROUP BY s.day ORDER BY s.day') ?: [];
        $byDay = [];
        foreach ($rows as $r) {
            $byDay[$r['day']] = $r;
        }
        $series = [];
        for ($i = $days - 1; $i >= 0; --$i) {
            $d = date('Y-m-d', strtotime('-' . $i . ' days'));
            $series[] = [
                'day' => $d,
                'views' => isset($byDay[$d]) ? (int) $byDay[$d]['views'] : 0,
                'signups' => isset($byDay[$d]) ? (int) $byDay[$d]['signups'] : 0,
                'clicks' => isset($byDay[$d]) ? (int) $byDay[$d]['clicks'] : 0,
            ];
        }

        $dev = $db->executeS('SELECT s.device, ' . $sum . ' FROM `' . $p . 'stat` s WHERE ' . $where . ' GROUP BY s.device') ?: [];
        $popups = $db->executeS('SELECT s.id_popup, p.name, ' . $sum . ' FROM `' . $p . 'stat` s LEFT JOIN `' . $p . 'popup` p ON p.id_popup = s.id_popup WHERE ' . $where . ' GROUP BY s.id_popup ORDER BY views DESC') ?: [];

        return [
            'days' => $days,
            'totals' => self::ints($totals),
            'previous' => self::ints($prev),
            'series' => $series,
            'devices' => array_map([__CLASS__, 'ints'], $dev),
            'popups' => array_map([__CLASS__, 'ints'], $popups),
            'funnel_started' => (int) $db->getValue('SELECT COUNT(*) FROM `' . $p . 'lead` WHERE date_add >= "' . pSQL($from) . '"' . ($idPopup ? ' AND id_popup = ' . (int) $idPopup : '')),
            'answers' => array_map(function ($r) {
                $r['n'] = (int) $r['n'];

                return $r;
            }, $db->executeS('SELECT a.id_popup, p.name, a.question, a.answer, SUM(a.count) n FROM `' . $p . 'answer` a
                LEFT JOIN `' . $p . 'popup` p ON p.id_popup = a.id_popup' . ($idPopup ? ' WHERE a.id_popup = ' . (int) $idPopup : '') . '
                GROUP BY a.id_popup, a.question, a.answer ORDER BY a.id_popup, a.question, n DESC LIMIT 300') ?: []),
            'feedback' => self::feedback($from, $idPopup),
        ];
    }

    /**
     * Written answers from textarea blocks, newest first.
     */
    public static function feedback($from, $idPopup = 0)
    {
        $where = 'f.date_add >= "' . pSQL($from) . ' 00:00:00"' . ($idPopup ? ' AND f.id_popup = ' . (int) $idPopup : '');
        if (\Shop::getContext() === \Shop::CONTEXT_SHOP) {
            $where .= ' AND f.id_shop = ' . (int) \Context::getContext()->shop->id;
        }

        return \Db::getInstance()->executeS('SELECT f.id_feedback, f.id_popup, p.name, f.question, f.rating, f.message, f.email, f.page, f.date_add
            FROM `' . _DB_PREFIX_ . 'popupstudio_feedback` f LEFT JOIN `' . _DB_PREFIX_ . 'popupstudio_popup` p ON p.id_popup = f.id_popup
            WHERE ' . $where . ' ORDER BY f.id_feedback DESC LIMIT 200') ?: [];
    }

    /**
     * Per-variant numbers with a two-proportion z-test against the first variant.
     */
    public static function variants($idPopup, $goal = 'signups', $minViews = 300)
    {
        $db = \Db::getInstance();
        $rows = $db->executeS('SELECT v.id_variant, v.label, v.weight, IFNULL(SUM(s.views),0) views, IFNULL(SUM(s.closes),0) closes, IFNULL(SUM(s.clicks),0) clicks,
            IFNULL(SUM(s.signups),0) signups, IFNULL(SUM(s.orders),0) orders, IFNULL(SUM(s.revenue),0) revenue
            FROM `' . _DB_PREFIX_ . 'popupstudio_variant` v
            LEFT JOIN `' . _DB_PREFIX_ . 'popupstudio_stat` s ON s.id_variant = v.id_variant
            WHERE v.id_popup = ' . (int) $idPopup . ' GROUP BY v.id_variant ORDER BY v.position, v.id_variant') ?: [];
        $rows = array_map([__CLASS__, 'ints'], $rows);
        if (!in_array($goal, ['signups', 'clicks', 'orders'], true)) {
            $goal = 'signups';
        }
        $base = $rows ? $rows[0] : null;
        $verdict = ['state' => 'none'];
        foreach ($rows as $i => &$r) {
            $r['rate'] = $r['views'] > 0 ? $r[$goal] / $r['views'] : 0;
            if ($i === 0 || !$base) {
                continue;
            }
            $z = self::z($base[$goal], $base['views'], $r[$goal], $r['views']);
            $r['z'] = $z;
            $r['confidence'] = self::confidence($z);
            $r['lift'] = $base['views'] && $base[$goal] ? ($r['rate'] / ($base[$goal] / $base['views']) - 1) : null;
        }
        unset($r);
        if (count($rows) > 1) {
            $enough = true;
            foreach ($rows as $r) {
                if ($r['views'] < $minViews) {
                    $enough = false;
                }
            }
            if (!$enough) {
                $verdict = ['state' => 'wait', 'min' => $minViews];
            } else {
                $best = null;
                foreach (array_slice($rows, 1) as $r) {
                    if ($r['confidence'] >= 0.95 && ($best === null || $r['rate'] > $best['rate'])) {
                        $best = $r;
                    }
                }
                if ($best && $best['rate'] > $rows[0]['rate']) {
                    $verdict = ['state' => 'winner', 'id_variant' => $best['id_variant'], 'label' => $best['label'], 'lift' => $best['lift'], 'confidence' => $best['confidence']];
                } elseif ($best) {
                    $verdict = ['state' => 'winner', 'id_variant' => $rows[0]['id_variant'], 'label' => $rows[0]['label'], 'lift' => null, 'confidence' => $best['confidence']];
                } else {
                    $verdict = ['state' => 'tie'];
                }
            }
        }

        return ['goal' => $goal, 'rows' => $rows, 'verdict' => $verdict];
    }

    public static function z($c1, $n1, $c2, $n2)
    {
        if ($n1 <= 0 || $n2 <= 0) {
            return 0.0;
        }
        $p = ($c1 + $c2) / ($n1 + $n2);
        $se = sqrt($p * (1 - $p) * (1 / $n1 + 1 / $n2));
        if ($se <= 0) {
            return 0.0;
        }

        return (($c2 / $n2) - ($c1 / $n1)) / $se;
    }

    /**
     * Two-sided confidence that the difference is real, from the normal distribution.
     */
    public static function confidence($z)
    {
        $x = abs($z) / sqrt(2);
        // Abramowitz and Stegun 7.1.26 approximation of erf.
        $t = 1 / (1 + 0.3275911 * $x);
        $y = 1 - (((((1.061405429 * $t - 1.453152027) * $t) + 1.421413741) * $t - 0.284496736) * $t + 0.254829592) * $t * exp(-$x * $x);

        return round($y, 4);
    }

    public static function ints($r)
    {
        if (!is_array($r)) {
            return $r;
        }
        foreach ($r as $k => $v) {
            if (in_array($k, ['name', 'label', 'day'], true)) {
                continue;
            }
            $r[$k] = $k === 'revenue' ? round((float) $v, 2) : (int) $v;
        }

        return $r;
    }

    /**
     * 14-day sparkline of views for the popups list.
     */
    public static function sparks()
    {
        $from = date('Y-m-d', strtotime('-13 days'));
        $rows = \Db::getInstance()->executeS('SELECT id_popup, day, SUM(views) v, SUM(signups) s, SUM(clicks) c FROM `' . _DB_PREFIX_ . 'popupstudio_stat` WHERE day >= "' . $from . '" GROUP BY id_popup, day') ?: [];
        $tot = \Db::getInstance()->executeS('SELECT id_popup, SUM(views) v, SUM(signups) s, SUM(clicks) c, SUM(orders) o FROM `' . _DB_PREFIX_ . 'popupstudio_stat` WHERE day >= "' . date('Y-m-d', strtotime('-29 days')) . '" GROUP BY id_popup') ?: [];
        $out = [];
        foreach ($tot as $t) {
            $out[(int) $t['id_popup']] = ['views' => (int) $t['v'], 'signups' => (int) $t['s'], 'clicks' => (int) $t['c'], 'orders' => (int) $t['o'], 'spark' => array_fill(0, 14, 0)];
        }
        foreach ($rows as $r) {
            $id = (int) $r['id_popup'];
            if (!isset($out[$id])) {
                $out[$id] = ['views' => 0, 'signups' => 0, 'clicks' => 0, 'orders' => 0, 'spark' => array_fill(0, 14, 0)];
            }
            $idx = 13 - (int) floor((strtotime(date('Y-m-d')) - strtotime($r['day'])) / 86400);
            if ($idx >= 0 && $idx < 14) {
                $out[$id]['spark'][$idx] = (int) $r['v'];
            }
        }

        return $out;
    }
}
