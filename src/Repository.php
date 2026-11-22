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
 * Storage for popups and their variants. Settings and content are JSON documents.
 */
class Repository
{
    const STATUSES = ['draft', 'live', 'paused'];

    private function db()
    {
        return \Db::getInstance();
    }

    private function t($name)
    {
        return _DB_PREFIX_ . 'popupstudio_' . $name;
    }

    public static function json($value)
    {
        return json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    public static function decode($value, $default = [])
    {
        if (!is_string($value) || $value === '') {
            return $default;
        }
        $d = json_decode($value, true);

        return is_array($d) ? $d : $default;
    }

    /**
     * @return array<int, array>
     */
    public function listPopups($idShop = null)
    {
        $sql = 'SELECT p.* FROM `' . $this->t('popup') . '` p';
        if ($idShop) {
            $sql .= ' INNER JOIN `' . $this->t('popup_shop') . '` s ON s.id_popup = p.id_popup AND s.id_shop = ' . (int) $idShop;
        }
        $sql .= ' ORDER BY p.priority DESC, p.position ASC, p.id_popup DESC';
        $rows = $this->db()->executeS($sql) ?: [];
        $out = [];
        foreach ($rows as $r) {
            $out[] = $this->hydrate($r, false);
        }

        return $out;
    }

    public function getPopup($id)
    {
        $r = $this->db()->getRow('SELECT * FROM `' . $this->t('popup') . '` WHERE id_popup = ' . (int) $id);

        return $r ? $this->hydrate($r, true) : null;
    }

    private function hydrate(array $r, $withContent)
    {
        $id = (int) $r['id_popup'];
        $variants = $this->db()->executeS('SELECT id_variant, label, weight, active, position' . ($withContent ? ', content' : '') . ' FROM `' . $this->t('variant') . '` WHERE id_popup = ' . $id . ' ORDER BY position, id_variant') ?: [];
        foreach ($variants as &$v) {
            $v['id_variant'] = (int) $v['id_variant'];
            $v['weight'] = (int) $v['weight'];
            $v['active'] = (int) $v['active'];
            if ($withContent) {
                $v['content'] = self::decode($v['content']);
            }
        }
        unset($v);
        $shops = $this->db()->executeS('SELECT id_shop FROM `' . $this->t('popup_shop') . '` WHERE id_popup = ' . $id) ?: [];

        return [
            'id' => $id,
            'name' => $r['name'],
            'status' => $r['status'],
            'template' => $r['template'],
            'priority' => (int) $r['priority'],
            'date_start' => $r['date_start'] ? substr($r['date_start'], 0, 16) : '',
            'date_end' => $r['date_end'] ? substr($r['date_end'], 0, 16) : '',
            'settings' => self::decode($r['settings']),
            'ab_active' => (int) $r['ab_active'],
            'position' => (int) $r['position'],
            'date_add' => $r['date_add'],
            'date_upd' => $r['date_upd'],
            'variants' => $variants,
            'shops' => array_map('intval', array_column($shops, 'id_shop')),
        ];
    }

    /**
     * Insert or update a popup with its variants. Returns the popup id.
     */
    public function save(array $data)
    {
        $id = isset($data['id']) ? (int) $data['id'] : 0;
        $status = in_array(isset($data['status']) ? $data['status'] : '', self::STATUSES, true) ? $data['status'] : 'draft';
        $row = [
            'name' => pSQL(\Tools::substr(trim((string) (isset($data['name']) ? $data['name'] : '')), 0, 128) ?: 'Popup'),
            'status' => pSQL($status),
            'template' => pSQL(preg_replace('/[^a-z0-9_-]/', '', (string) (isset($data['template']) ? $data['template'] : ''))),
            'priority' => (int) (isset($data['priority']) ? $data['priority'] : 0),
            'date_start' => self::date(isset($data['date_start']) ? $data['date_start'] : ''),
            'date_end' => self::date(isset($data['date_end']) ? $data['date_end'] : ''),
            'settings' => pSQL(self::json(isset($data['settings']) && is_array($data['settings']) ? $data['settings'] : []), true),
            'ab_active' => (int) !empty($data['ab_active']),
            'date_upd' => date('Y-m-d H:i:s'),
        ];
        // Empty dates are stored as NULL; everything else as given (null_values would also turn "" into NULL).
        foreach (['date_start', 'date_end'] as $k) {
            $row[$k] = $row[$k] === null ? ['type' => 'sql', 'value' => 'NULL'] : $row[$k];
        }
        if ($id && $this->db()->getValue('SELECT id_popup FROM `' . $this->t('popup') . '` WHERE id_popup = ' . $id)) {
            if (!$this->db()->update('popupstudio_popup', $row, 'id_popup = ' . $id)) {
                return 0;
            }
        } else {
            $row['date_add'] = $row['date_upd'];
            $row['position'] = (int) $this->db()->getValue('SELECT IFNULL(MAX(position), 0) + 1 FROM `' . $this->t('popup') . '`');
            if (!$this->db()->insert('popupstudio_popup', $row)) {
                return 0;
            }
            $id = (int) $this->db()->Insert_ID();
        }

        $shops = isset($data['shops']) && is_array($data['shops']) && $data['shops'] ? array_map('intval', $data['shops']) : [(int) \Context::getContext()->shop->id];
        $this->db()->delete('popupstudio_popup_shop', 'id_popup = ' . $id);
        foreach (array_unique($shops) as $s) {
            if ($s > 0) {
                $this->db()->insert('popupstudio_popup_shop', ['id_popup' => $id, 'id_shop' => $s]);
            }
        }

        if (isset($data['variants']) && is_array($data['variants'])) {
            $keep = [];
            foreach (array_values($data['variants']) as $i => $v) {
                $vid = isset($v['id_variant']) ? (int) $v['id_variant'] : 0;
                $vrow = [
                    'id_popup' => $id,
                    'label' => pSQL(\Tools::substr((string) (isset($v['label']) ? $v['label'] : chr(65 + $i)), 0, 64)),
                    'weight' => max(0, min(100, (int) (isset($v['weight']) ? $v['weight'] : 50))),
                    'content' => pSQL(self::json(isset($v['content']) && is_array($v['content']) ? $v['content'] : []), true),
                    'active' => (int) (isset($v['active']) ? $v['active'] : 1),
                    'position' => $i,
                ];
                if ($vid && $this->db()->getValue('SELECT id_variant FROM `' . $this->t('variant') . '` WHERE id_variant = ' . $vid . ' AND id_popup = ' . $id)) {
                    $this->db()->update('popupstudio_variant', $vrow, 'id_variant = ' . $vid);
                } else {
                    $this->db()->insert('popupstudio_variant', $vrow);
                    $vid = (int) $this->db()->Insert_ID();
                }
                $keep[] = $vid;
            }
            if ($keep) {
                $this->db()->delete('popupstudio_variant', 'id_popup = ' . $id . ' AND id_variant NOT IN (' . implode(',', $keep) . ')');
            }
        }

        return $id;
    }

    public function setStatus($id, $status)
    {
        if (!in_array($status, self::STATUSES, true)) {
            return false;
        }

        return $this->db()->update('popupstudio_popup', ['status' => pSQL($status), 'date_upd' => date('Y-m-d H:i:s')], 'id_popup = ' . (int) $id);
    }

    public function delete($id)
    {
        $id = (int) $id;
        foreach (['popup', 'popup_shop', 'variant', 'stat', 'answer', 'prize', 'play'] as $t) {
            $this->db()->delete('popupstudio_' . $t, 'id_popup = ' . $id);
        }

        return true;
    }

    public function duplicate($id)
    {
        $p = $this->getPopup($id);
        if (!$p) {
            return 0;
        }
        unset($p['id']);
        $p['name'] = \Tools::substr($p['name'] . ' (copy)', 0, 128);
        $p['status'] = 'draft';
        foreach ($p['variants'] as &$v) {
            unset($v['id_variant']);
        }
        unset($v);

        return $this->save($p);
    }

    public function reorder(array $ids)
    {
        foreach (array_values($ids) as $i => $id) {
            $this->db()->update('popupstudio_popup', ['position' => $i], 'id_popup = ' . (int) $id);
        }

        return true;
    }

    /**
     * Live popups for one shop, with their active variants (content included).
     */
    public function livePopups($idShop)
    {
        $now = date('Y-m-d H:i:s');
        $rows = $this->db()->executeS('SELECT p.* FROM `' . $this->t('popup') . '` p
            INNER JOIN `' . $this->t('popup_shop') . '` s ON s.id_popup = p.id_popup AND s.id_shop = ' . (int) $idShop . '
            WHERE p.status = "live"
              AND (p.date_start IS NULL OR p.date_start <= "' . pSQL($now) . '")
              AND (p.date_end IS NULL OR p.date_end >= "' . pSQL($now) . '")
            ORDER BY p.priority DESC, p.position ASC') ?: [];
        $out = [];
        foreach ($rows as $r) {
            $p = $this->hydrate($r, true);
            $p['variants'] = array_values(array_filter($p['variants'], function ($v) {
                return (int) $v['active'] === 1;
            }));
            if ($p['variants']) {
                $out[] = $p;
            }
        }

        return $out;
    }

    private static function date($v)
    {
        $v = trim((string) $v);
        if ($v === '') {
            return null;
        }
        $ts = strtotime(str_replace('T', ' ', $v));

        return $ts ? date('Y-m-d H:i:s', $ts) : null;
    }
}
