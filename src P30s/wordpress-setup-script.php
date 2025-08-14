// این اسکریپت را در مسیر مناسب در هاست خود قرار دهید و یک بار اجرا کنید
// دقت کنید که این اسکریپت جدول جدید در دیتابیس ایجاد می‌کند، پس از اجرای آن اطمینان حاصل کنید

<?php
// فایل راه‌اندازی سیستم پرداخت و خرید - setup-payment-system.php

// اطمینان از اینکه فقط در محیط وردپرس اجرا می‌شود
if (!defined('ABSPATH')) {
    define('ABSPATH', dirname(__FILE__) . '/');
    require_once(ABSPATH . 'wp-load.php');
}

// بررسی دسترسی مدیر
if (!current_user_can('administrator')) {
    die('دسترسی غیرمجاز');
}

echo '<h1>راه‌اندازی سیستم خرید و پرداخت</h1>';

// گام 1: ایجاد جدول تراکنش‌ها در دیتابیس
function create_transactions_table() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();
    
    $table_name = $wpdb->prefix . 'transactions';
    
    if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
        $sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            hash varchar(255) NOT NULL,
            amount decimal(10,2) NOT NULL,
            wallet_address varchar(255) DEFAULT '',
            type varchar(50) DEFAULT '',
            user_id bigint(20) DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY hash (hash)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
        
        echo '<p style="color: green;">جدول تراکنش‌ها با موفقیت ایجاد شد.</p>';
    } else {
        echo '<p style="color: blue;">جدول تراکنش‌ها از قبل وجود دارد.</p>';
    }
}

// گام 2: ثبت Custom Post Type خرید‌های کاربران
function register_purchase_post_type() {
    if (!post_type_exists('user_purchase')) {
        register_post_type('user_purchase',
            array(
                'labels' => array(
                    'name' => 'خریدهای کاربران',
                    'singular_name' => 'خرید کاربر',
                    'add_new' => 'افزودن خرید جدید',
                    'add_new_item' => 'افزودن خرید جدید',
                    'edit_item' => 'ویرایش خرید',
                    'all_items' => 'همه خریدها'
                ),
                'public' => false,
                'show_ui' => true,
                'show_in_menu' => true,
                'capability_type' => 'post',
                'hierarchical' => false,
                'menu_position' => 25,
                'menu_icon' => 'dashicons-cart',
                'supports' => array('title'),
                'has_archive' => false,
                'show_in_rest' => true
            )
        );
        
        echo '<p style="color: green;">Custom Post Type خرید‌های کاربران با موفقیت ثبت شد.</p>';
    } else {
        echo '<p style="color: blue;">Custom Post Type خرید‌های کاربران از قبل وجود دارد.</p>';
    }
}

// گام 3: ثبت API Endpoints
function register_api_endpoints() {
    // این بخش نیاز به اجرای فیزیکی ندارد، زیرا در کد functions.php قرار می‌گیرد
    echo '<p style="color: green;">کدهای API Endpoints را در فایل functions.php قرار دهید.</p>';
    echo '<textarea style="width: 100%; height: 100px;">
// ثبت endpoint برای ذخیره خرید
add_action(\'rest_api_init\', function() {
    register_rest_route(\'pcs/v1\', \'/save-purchase\', array(
        \'methods\' => \'POST\',
        \'callback\' => \'save_user_purchase\',
        \'permission_callback\' => function() {
            return is_user_logged_in();
        }
    ));
    
    register_rest_route(\'pcs/v1\', \'/user-purchases\', array(
        \'methods\' => \'GET\',
        \'callback\' => \'get_user_purchases\',
        \'permission_callback\' => function() {
            return is_user_logged_in();
        }
    ));
    
    register_rest_route(\'pcs/v1\', \'/check-vip-status\', array(
        \'methods\' => \'GET\',
        \'callback\' => \'check_user_vip_status\',
        \'permission_callback\' => function() {
            return is_user_logged_in();
        }
    ));
});
    </textarea>';
}

// گام 4: ایجاد سطل‌های متادیتا برای کاربران
function create_user_purchase_meta() {
    // بررسی وجود متادیتا برای کاربر نمونه
    $test_user_id = 1; // آیدی مدیر سایت
    $has_meta = get_user_meta($test_user_id, 'user_purchases', true);
    
    if (empty($has_meta)) {
        update_user_meta($test_user_id, 'user_purchases', array());
        echo '<p style="color: green;">متادیتای خرید‌های کاربر ایجاد شد.</p>';
    } else {
        echo '<p style="color: blue;">متادیتای خرید‌های کاربر از قبل وجود دارد.</p>';
    }
}

// گام 5: به‌روزرسانی فلش‌ها
function flush_all_caches() {
    // بازسازی permalinks
    flush_rewrite_rules();
    
    echo '<p style="color: green;">فلش‌ها با موفقیت انجام شد.</p>';
}

// اجرای تمام مراحل
echo '<hr><h2>در حال اجرای گام 1: ایجاد جدول تراکنش‌ها</h2>';
create_transactions_table();

echo '<hr><h2>در حال اجرای گام 2: ثبت Custom Post Type</h2>';
register_purchase_post_type();

echo '<hr><h2>در حال اجرای گام 3: ثبت API Endpoints</h2>';
register_api_endpoints();

echo '<hr><h2>در حال اجرای گام 4: ایجاد متادیتای کاربر</h2>';
create_user_purchase_meta();

echo '<hr><h2>در حال اجرای گام 5: به‌روزرسانی فلش‌ها</h2>';
flush_all_caches();

echo '<hr><h2>تبریک! راه‌اندازی با موفقیت انجام شد</h2>';
echo '<p>می‌توانید تغییرات در کدهای فرانت‌اند را انجام دهید.</p>';
?>