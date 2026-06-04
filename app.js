/* ============================================
   BODEGA NI TATAY - PROCUREMENT SYSTEM
   JavaScript Application
   ============================================ */

// ============================================
// DEMO DATA
// ============================================

const DEMO_USERS = {
    owner: {
        id: 1,
        name: 'Tatay Owner',
        email: 'owner@bodega.com',
        role: 'owner',
        roleLabel: 'Owner',
        avatar: 'TO',
        permissions: ['can_approve_po', 'can_view_reports', 'can_manage_suppliers', 'can_view_inventory', 'can_update_stock']
    },
    manager: {
        id: 2,
        name: 'Juan Manager',
        email: 'manager@bodega.com',
        role: 'manager',
        roleLabel: 'Manager',
        avatar: 'JM',
        permissions: ['can_create_po', 'can_view_inventory', 'can_update_stock', 'can_view_reports']
    },
    stock: {
        id: 3,
        name: 'Maria Stock',
        email: 'stock@bodega.com',
        role: 'stock_personnel',
        roleLabel: 'Stock Personnel',
        avatar: 'MS',
        permissions: ['can_update_stock', 'can_view_inventory']
    }
};

const DEMO_UNITS = [
    { id: 1, name: 'Piece', abbreviation: 'pc' },
    { id: 2, name: 'Kilogram', abbreviation: 'kg' },
    { id: 3, name: 'Liter', abbreviation: 'L' },
    { id: 4, name: 'Box', abbreviation: 'bx' },
    { id: 5, name: 'Pack', abbreviation: 'pk' },
    { id: 6, name: 'Bag', abbreviation: 'bg' },
    { id: 7, name: 'Bottle', abbreviation: 'btl' },
    { id: 8, name: 'Can', abbreviation: 'can' }
];

const DEMO_CATEGORIES = [
    { id: 1, name: 'Rice & Grains', description: 'All types of rice and grain products' },
    { id: 2, name: 'Cooking Oil', description: 'Cooking oils and fats' },
    { id: 3, name: 'Sugar & Sweeteners', description: 'Sugar, honey, and other sweeteners' },
    { id: 4, name: 'Canned Goods', description: 'Canned and preserved foods' },
    { id: 5, name: 'Noodles & Pasta', description: 'Instant noodles, pasta, and noodles' },
    { id: 6, name: 'Beverages', description: 'Drinks and beverages' },
    { id: 7, name: 'Snacks', description: 'Chips, biscuits, and snacks' },
    { id: 8, name: 'Personal Care', description: 'Soap, shampoo, and personal care items' },
    { id: 9, name: 'Cleaning Supplies', description: 'Detergent, bleach, and cleaning products' },
    { id: 10, name: 'Condiments', description: 'Sauce, vinegar, and condiments' }
];

const DEMO_SUPPLIERS = [
    { id: 1, name: 'ABC Trading Co.', contact_person: 'Mr. Santos', email: 'orders@abctrading.com', phone: '09123456789', address: '123 Main St, Manila', is_active: true },
    { id: 2, name: 'Mega Grocery Supply', contact_person: 'Ms. Cruz', email: 'sales@megagrocery.com', phone: '09234567890', address: '456 Commerce Ave, Quezon City', is_active: true },
    { id: 3, name: 'Prime Foods Distributor', contact_person: 'Mr. Reyes', email: 'info@primefoods.com', phone: '09345678901', address: '789 Market St, Pasig', is_active: true },
    { id: 4, name: 'Daily Essentials Inc.', contact_person: 'Ms. Garcia', email: 'orders@dailyessentials.com', phone: '09456789012', address: '321 Supply Rd, Makati', is_active: true },
    { id: 5, name: 'Golden Rice Mills', contact_person: 'Mr. Lim', email: 'sales@goldenrice.com', phone: '09567890123', address: '654 Rice St, Bulacan', is_active: true }
];

const DEMO_ITEMS = [
    { id: 1, sku: 'RICE-001', barcode: '1234567890123', name: 'Jasmine Rice 5kg', description: 'Premium jasmine rice', category_id: 1, unit_id: 6, supplier_id: 1, current_stock: 12, reorder_point: 20, reorder_qty: 50, max_stock: 100, last_purchase_price: 250.00, avg_purchase_price: 245.50, has_expiration: false, is_active: true },
    { id: 2, sku: 'RICE-002', barcode: '1234567890124', name: 'Sinandomeng Rice 5kg', description: 'Local sinandomeng rice', category_id: 1, unit_id: 6, supplier_id: 5, current_stock: 18, reorder_point: 15, reorder_qty: 40, max_stock: 80, last_purchase_price: 220.00, avg_purchase_price: 218.00, has_expiration: false, is_active: true },
    { id: 3, sku: 'OIL-001', barcode: '1234567890125', name: 'Cooking Oil 1L', description: 'Vegetable cooking oil', category_id: 2, unit_id: 7, supplier_id: 2, current_stock: 8, reorder_point: 15, reorder_qty: 30, max_stock: 50, last_purchase_price: 150.00, avg_purchase_price: 148.00, has_expiration: false, is_active: true },
    { id: 4, sku: 'OIL-002', barcode: '1234567890126', name: 'Olive Oil 500ml', description: 'Extra virgin olive oil', category_id: 2, unit_id: 7, supplier_id: 2, current_stock: 6, reorder_point: 10, reorder_qty: 20, max_stock: 30, last_purchase_price: 350.00, avg_purchase_price: 345.00, has_expiration: false, is_active: true },
    { id: 5, sku: 'SUGAR-001', barcode: '1234567890127', name: 'White Sugar 1kg', description: 'Refined white sugar', category_id: 3, unit_id: 2, supplier_id: 1, current_stock: 25, reorder_point: 10, reorder_qty: 40, max_stock: 60, last_purchase_price: 65.00, avg_purchase_price: 63.50, has_expiration: false, is_active: true },
    { id: 6, sku: 'SUGAR-002', barcode: '1234567890128', name: 'Brown Sugar 500g', description: 'Muscovado brown sugar', category_id: 3, unit_id: 2, supplier_id: 1, current_stock: 14, reorder_point: 12, reorder_qty: 30, max_stock: 40, last_purchase_price: 45.00, avg_purchase_price: 44.00, has_expiration: false, is_active: true },
    { id: 7, sku: 'NOOD-001', barcode: '1234567890129', name: 'Instant Noodles Chicken', description: 'Chicken flavor instant noodles', category_id: 5, unit_id: 5, supplier_id: 3, current_stock: 45, reorder_point: 30, reorder_qty: 100, max_stock: 150, last_purchase_price: 12.00, avg_purchase_price: 11.80, has_expiration: false, is_active: true },
    { id: 8, sku: 'NOOD-002', barcode: '1234567890130', name: 'Instant Noodles Beef', description: 'Beef flavor instant noodles', category_id: 5, unit_id: 5, supplier_id: 3, current_stock: 38, reorder_point: 30, reorder_qty: 100, max_stock: 150, last_purchase_price: 12.00, avg_purchase_price: 11.80, has_expiration: false, is_active: true },
    { id: 9, sku: 'NOOD-003', barcode: '1234567890131', name: 'Spaghetti 500g', description: 'Italian style spaghetti', category_id: 5, unit_id: 2, supplier_id: 3, current_stock: 22, reorder_point: 15, reorder_qty: 40, max_stock: 60, last_purchase_price: 55.00, avg_purchase_price: 54.00, has_expiration: false, is_active: true },
    { id: 10, sku: 'SOAP-001', barcode: '1234567890132', name: 'Bath Soap Antibacterial', description: 'Antibacterial bath soap', category_id: 8, unit_id: 1, supplier_id: 4, current_stock: 0, reorder_point: 20, reorder_qty: 50, max_stock: 80, last_purchase_price: 35.00, avg_purchase_price: 34.00, has_expiration: false, is_active: true },
    { id: 11, sku: 'SOAP-002', barcode: '1234567890133', name: 'Shampoo 200ml', description: 'Anti-dandruff shampoo', category_id: 8, unit_id: 7, supplier_id: 4, current_stock: 16, reorder_point: 15, reorder_qty: 40, max_stock: 50, last_purchase_price: 85.00, avg_purchase_price: 82.00, has_expiration: false, is_active: true },
    { id: 12, sku: 'TUNA-001', barcode: '1234567890134', name: 'Canned Tuna Flakes 155g', description: 'Tuna flakes in oil', category_id: 4, unit_id: 8, supplier_id: 2, current_stock: 30, reorder_point: 20, reorder_qty: 50, max_stock: 80, last_purchase_price: 45.00, avg_purchase_price: 44.50, has_expiration: true, shelf_life_days: 730, is_active: true },
    { id: 13, sku: 'TUNA-002', barcode: '1234567890135', name: 'Canned Sardines 155g', description: 'Sardines in tomato sauce', category_id: 4, unit_id: 8, supplier_id: 2, current_stock: 42, reorder_point: 25, reorder_qty: 60, max_stock: 100, last_purchase_price: 28.00, avg_purchase_price: 27.50, has_expiration: true, shelf_life_days: 730, is_active: true },
    { id: 14, sku: 'BEV-001', barcode: '1234567890136', name: 'Soft Drink 1.5L', description: 'Cola soft drink', category_id: 6, unit_id: 7, supplier_id: 2, current_stock: 20, reorder_point: 15, reorder_qty: 40, max_stock: 60, last_purchase_price: 55.00, avg_purchase_price: 54.00, has_expiration: false, is_active: true },
    { id: 15, sku: 'BEV-002', barcode: '1234567890137', name: 'Bottled Water 500ml', description: 'Purified bottled water', category_id: 6, unit_id: 7, supplier_id: 2, current_stock: 55, reorder_point: 30, reorder_qty: 80, max_stock: 120, last_purchase_price: 15.00, avg_purchase_price: 14.50, has_expiration: false, is_active: true },
    { id: 16, sku: 'SNACK-001', barcode: '1234567890138', name: 'Potato Chips 150g', description: 'Classic potato chips', category_id: 7, unit_id: 5, supplier_id: 3, current_stock: 28, reorder_point: 20, reorder_qty: 50, max_stock: 80, last_purchase_price: 42.00, avg_purchase_price: 41.00, has_expiration: false, is_active: true },
    { id: 17, sku: 'SNACK-002', barcode: '1234567890139', name: 'Chocolate Bar 50g', description: 'Milk chocolate bar', category_id: 7, unit_id: 1, supplier_id: 3, current_stock: 35, reorder_point: 25, reorder_qty: 60, max_stock: 90, last_purchase_price: 35.00, avg_purchase_price: 34.00, has_expiration: false, is_active: true },
    { id: 18, sku: 'CLEAN-001', barcode: '1234567890140', name: 'Detergent Powder 1kg', description: 'Laundry detergent powder', category_id: 9, unit_id: 2, supplier_id: 4, current_stock: 14, reorder_point: 15, reorder_qty: 40, max_stock: 50, last_purchase_price: 95.00, avg_purchase_price: 93.00, has_expiration: false, is_active: true },
    { id: 19, sku: 'CLEAN-002', barcode: '1234567890141', name: 'Dishwashing Liquid 500ml', description: 'Lemon dishwashing liquid', category_id: 9, unit_id: 7, supplier_id: 4, current_stock: 19, reorder_point: 15, reorder_qty: 40, max_stock: 50, last_purchase_price: 55.00, avg_purchase_price: 54.00, has_expiration: false, is_active: true },
    { id: 20, sku: 'COND-001', barcode: '1234567890142', name: 'Soy Sauce 1L', description: 'Premium soy sauce', category_id: 10, unit_id: 7, supplier_id: 1, current_stock: 11, reorder_point: 12, reorder_qty: 30, max_stock: 40, last_purchase_price: 75.00, avg_purchase_price: 73.00, has_expiration: false, is_active: true },
    { id: 21, sku: 'COND-002', barcode: '1234567890143', name: 'Vinegar 1L', description: 'Cane vinegar', category_id: 10, unit_id: 7, supplier_id: 1, current_stock: 9, reorder_point: 10, reorder_qty: 30, max_stock: 40, last_purchase_price: 35.00, avg_purchase_price: 34.00, has_expiration: false, is_active: true },
    { id: 22, sku: 'COND-003', barcode: '1234567890144', name: 'Fish Sauce 750ml', description: 'Premium fish sauce', category_id: 10, unit_id: 7, supplier_id: 1, current_stock: 7, reorder_point: 10, reorder_qty: 25, max_stock: 35, last_purchase_price: 65.00, avg_purchase_price: 63.00, has_expiration: false, is_active: true }
];

const DEMO_PURCHASE_ORDERS = [
    {
        id: 1,
        po_number: 'PO-20260601-001',
        requester_id: 2,
        requester_notes: 'Regular restock for the week. Rice is running low.',
        approver_id: 1,
        approval_notes: 'Approved. Good timing for the weekend rush.',
        supplier_id: 1,
        status: 'received',
        subtotal: 17250.00,
        tax_amount: 0,
        total_amount: 17250.00,
        created_at: '2026-06-01T09:00:00Z',
        submitted_at: '2026-06-01T09:00:00Z',
        approved_at: '2026-06-01T10:30:00Z',
        rejected_at: null,
        ordered_at: '2026-06-01T14:00:00Z',
        expected_delivery: '2026-06-03',
        received_at: '2026-06-03T11:00:00Z'
    },
    {
        id: 2,
        po_number: 'PO-20260602-002',
        requester_id: 2,
        requester_notes: 'Need more cooking oil and canned goods.',
        approver_id: 1,
        approval_notes: 'Approved. Check if we need the premium olive oil too.',
        supplier_id: 2,
        status: 'received',
        subtotal: 8900.00,
        tax_amount: 0,
        total_amount: 8900.00,
        created_at: '2026-06-02T10:00:00Z',
        submitted_at: '2026-06-02T10:00:00Z',
        approved_at: '2026-06-02T11:00:00Z',
        rejected_at: null,
        ordered_at: '2026-06-02T13:00:00Z',
        expected_delivery: '2026-06-04',
        received_at: '2026-06-04T09:00:00Z'
    },
    {
        id: 3,
        po_number: 'PO-20260603-003',
        requester_id: 2,
        requester_notes: 'Urgent! We are out of bath soap and running low on condiments.',
        approver_id: 1,
        approval_notes: 'Approved. Bath soap is indeed out of stock.',
        supplier_id: 4,
        status: 'ordered',
        subtotal: 6850.00,
        tax_amount: 0,
        total_amount: 6850.00,
        created_at: '2026-06-03T08:00:00Z',
        submitted_at: '2026-06-03T08:00:00Z',
        approved_at: '2026-06-03T09:15:00Z',
        rejected_at: null,
        ordered_at: '2026-06-03T11:00:00Z',
        expected_delivery: '2026-06-06',
        received_at: null
    },
    {
        id: 4,
        po_number: 'PO-20260604-004',
        requester_id: 2,
        requester_notes: 'Need noodles and snacks for the weekend.',
        approver_id: null,
        approval_notes: null,
        supplier_id: 3,
        status: 'pending',
        subtotal: 0,
        tax_amount: 0,
        total_amount: 0,
        created_at: '2026-06-04T14:00:00Z',
        submitted_at: '2026-06-04T14:00:00Z',
        approved_at: null,
        rejected_at: null,
        ordered_at: null,
        expected_delivery: '2026-06-07',
        received_at: null
    },
    {
        id: 5,
        po_number: 'PO-20260604-005',
        requester_id: 3,
        requester_notes: 'Daily count shows we need more rice and sugar.',
        approver_id: null,
        approval_notes: null,
        supplier_id: 5,
        status: 'pending',
        subtotal: 0,
        tax_amount: 0,
        total_amount: 0,
        created_at: '2026-06-04T15:30:00Z',
        submitted_at: '2026-06-04T15:30:00Z',
        approved_at: null,
        rejected_at: null,
        ordered_at: null,
        expected_delivery: '2026-06-07',
        received_at: null
    }
];

const DEMO_PO_ITEMS = [
    { id: 1, po_id: 1, item_id: 1, requested_qty: 50, approved_qty: 50, unit_price: 250.00, total_price: 12500.00, received_qty: 50, notes: '' },
    { id: 2, po_id: 1, item_id: 5, requested_qty: 40, approved_qty: 40, unit_price: 65.00, total_price: 2600.00, received_qty: 40, notes: '' },
    { id: 3, po_id: 1, item_id: 20, requested_qty: 30, approved_qty: 30, unit_price: 75.00, total_price: 2250.00, received_qty: 30, notes: '' },
    { id: 4, po_id: 2, item_id: 3, requested_qty: 30, approved_qty: 30, unit_price: 150.00, total_price: 4500.00, received_qty: 30, notes: '' },
    { id: 5, po_id: 2, item_id: 12, requested_qty: 50, approved_qty: 50, unit_price: 45.00, total_price: 2250.00, received_qty: 50, notes: '' },
    { id: 6, po_id: 2, item_id: 13, requested_qty: 60, approved_qty: 60, unit_price: 28.00, total_price: 1680.00, received_qty: 60, notes: '' },
    { id: 7, po_id: 2, item_id: 14, requested_qty: 40, approved_qty: 40, unit_price: 55.00, total_price: 2200.00, received_qty: 40, notes: '' },
    { id: 8, po_id: 3, item_id: 10, requested_qty: 50, approved_qty: 50, unit_price: 35.00, total_price: 1750.00, received_qty: 0, notes: '' },
    { id: 9, po_id: 3, item_id: 11, requested_qty: 40, approved_qty: 40, unit_price: 85.00, total_price: 3400.00, received_qty: 0, notes: '' },
    { id: 10, po_id: 3, item_id: 18, requested_qty: 40, approved_qty: 40, unit_price: 95.00, total_price: 3800.00, received_qty: 0, notes: '' },
    { id: 11, po_id: 4, item_id: 7, requested_qty: 100, approved_qty: null, unit_price: null, total_price: null, received_qty: 0, notes: 'For weekend rush' },
    { id: 12, po_id: 4, item_id: 8, requested_qty: 100, approved_qty: null, unit_price: null, total_price: null, received_qty: 0, notes: 'For weekend rush' },
    { id: 13, po_id: 4, item_id: 16, requested_qty: 50, approved_qty: null, unit_price: null, total_price: null, received_qty: 0, notes: '' },
    { id: 14, po_id: 4, item_id: 17, requested_qty: 60, approved_qty: null, unit_price: null, total_price: null, received_qty: 0, notes: '' },
    { id: 15, po_id: 5, item_id: 1, requested_qty: 50, approved_qty: null, unit_price: null, total_price: null, received_qty: 0, notes: 'Urgent - only 12 bags left' },
    { id: 16, po_id: 5, item_id: 2, requested_qty: 40, approved_qty: null, unit_price: null, total_price: null, received_qty: 0, notes: '' },
    { id: 17, po_id: 5, item_id: 5, requested_qty: 40, approved_qty: null, unit_price: null, total_price: null, received_qty: 0, notes: '' }
];

const DEMO_STOCK_LOGS = [
    { id: 1, item_id: 1, user_id: 3, type: 'purchase', quantity: 50, old_stock: 12, new_stock: 62, reason: 'PO-20260601-001 received', po_id: 1, reference_no: 'PO-20260601-001', created_at: '2026-06-03T11:00:00Z' },
    { id: 2, item_id: 5, user_id: 3, type: 'purchase', quantity: 40, old_stock: 25, new_stock: 65, reason: 'PO-20260601-001 received', po_id: 1, reference_no: 'PO-20260601-001', created_at: '2026-06-03T11:00:00Z' },
    { id: 3, item_id: 3, user_id: 3, type: 'purchase', quantity: 30, old_stock: 8, new_stock: 38, reason: 'PO-20260602-002 received', po_id: 2, reference_no: 'PO-20260602-002', created_at: '2026-06-04T09:00:00Z' },
    { id: 4, item_id: 12, user_id: 3, type: 'purchase', quantity: 50, old_stock: 30, new_stock: 80, reason: 'PO-20260602-002 received', po_id: 2, reference_no: 'PO-20260602-002', created_at: '2026-06-04T09:00:00Z' },
    { id: 5, item_id: 1, user_id: 3, type: 'daily_count', quantity: 0, old_stock: 62, new_stock: 58, reason: 'Daily stock count - June 3', reference_no: null, expected_stock: 62, actual_count: 58, discrepancy: -4, created_at: '2026-06-03T08:00:00Z' },
    { id: 6, item_id: 3, user_id: 3, type: 'daily_count', quantity: 0, old_stock: 38, new_stock: 38, reason: 'Daily stock count - June 3', reference_no: null, expected_stock: 38, actual_count: 38, discrepancy: 0, created_at: '2026-06-03T08:00:00Z' },
    { id: 7, item_id: 1, user_id: 3, type: 'sale', quantity: -20, old_stock: 58, new_stock: 38, reason: 'Daily sales', reference_no: null, created_at: '2026-06-03T20:00:00Z' },
    { id: 8, item_id: 1, user_id: 3, type: 'daily_count', quantity: 0, old_stock: 38, new_stock: 36, reason: 'Daily stock count - June 4', reference_no: null, expected_stock: 38, actual_count: 36, discrepancy: -2, created_at: '2026-06-04T08:00:00Z' },
    { id: 9, item_id: 3, user_id: 3, type: 'daily_count', quantity: 0, old_stock: 38, new_stock: 35, reason: 'Daily stock count - June 4', reference_no: null, expected_stock: 38, actual_count: 35, discrepancy: -3, created_at: '2026-06-04T08:00:00Z' },
    { id: 10, item_id: 10, user_id: 3, type: 'sale', quantity: -16, old_stock: 16, new_stock: 0, reason: 'Daily sales - sold out', reference_no: null, created_at: '2026-06-04T20:00:00Z' }
];

const DEMO_NOTIFICATIONS = [
    { id: 1, user_id: 1, type: 'po_pending', title: 'New PO Request', message: 'Juan Manager submitted PO-20260604-004 for approval', reference_id: 4, reference_type: 'purchase_order', is_read: false, created_at: '2026-06-04T14:00:00Z' },
    { id: 2, user_id: 1, type: 'po_pending', title: 'New PO Request', message: 'Maria Stock submitted PO-20260604-005 for approval', reference_id: 5, reference_type: 'purchase_order', is_read: false, created_at: '2026-06-04T15:30:00Z' },
    { id: 3, user_id: 1, type: 'low_stock', title: 'Low Stock Alert', message: 'Bath Soap Antibacterial is now OUT OF STOCK', reference_id: 10, reference_type: 'item', is_read: false, created_at: '2026-06-04T20:00:00Z' },
    { id: 4, user_id: 2, type: 'po_approved', title: 'PO Approved', message: 'Your PO-20260603-003 has been approved by Tatay Owner', reference_id: 3, reference_type: 'purchase_order', is_read: true, created_at: '2026-06-03T09:15:00Z' },
    { id: 5, user_id: 3, type: 'po_received', title: 'PO Received', message: 'PO-20260602-002 items have been received and inventory updated', reference_id: 2, reference_type: 'purchase_order', is_read: true, created_at: '2026-06-04T09:00:00Z' }
];

const DEMO_DAILY_COUNTS = [
    { id: 1, item_id: 1, user_id: 3, count_date: '2026-06-03', expected_stock: 62, actual_count: 58, discrepancy: -4, notes: 'Some bags may have been damaged', is_resolved: true, resolution_note: 'Confirmed - 4 bags damaged during delivery', created_at: '2026-06-03T08:00:00Z' },
    { id: 2, item_id: 3, user_id: 3, count_date: '2026-06-03', expected_stock: 38, actual_count: 38, discrepancy: 0, notes: '', is_resolved: true, resolution_note: '', created_at: '2026-06-03T08:00:00Z' },
    { id: 3, item_id: 1, user_id: 3, count_date: '2026-06-04', expected_stock: 38, actual_count: 36, discrepancy: -2, notes: '', is_resolved: false, resolution_note: '', created_at: '2026-06-04T08:00:00Z' },
    { id: 4, item_id: 3, user_id: 3, count_date: '2026-06-04', expected_stock: 38, actual_count: 35, discrepancy: -3, notes: '', is_resolved: false, resolution_note: '', created_at: '2026-06-04T08:00:00Z' }
];

// ============================================
// GLOBAL STATE
// ============================================

let currentUser = null;
let currentPage = 'dashboard';
let selectedRole = 'manager';
let tempPOItems = [];
let currentPOForApproval = null;
let currentPOForReceive = null;
let currentItemForAdjust = null;

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatCurrency(amount) {
    return 'P' + parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + ' days ago';
    return formatDate(dateString);
}

function getItemStatus(item) {
    if (item.current_stock <= 0) return { label: 'Out of Stock', class: 'badge-danger', level: 'low' };
    if (item.current_stock <= item.reorder_point) return { label: 'Low Stock', class: 'badge-warning', level: 'medium' };
    return { label: 'Normal', class: 'badge-success', level: 'high' };
}

function getStockPercentage(item) {
    if (item.max_stock <= 0) return 100;
    return Math.min(100, Math.round((item.current_stock / item.max_stock) * 100));
}

function getCategoryName(categoryId) {
    const cat = DEMO_CATEGORIES.find(c => c.id === categoryId);
    return cat ? cat.name : 'Unknown';
}

function getUnitName(unitId) {
    const unit = DEMO_UNITS.find(u => u.id === unitId);
    return unit ? unit.name : 'Unknown';
}

function getUnitAbbreviation(unitId) {
    const unit = DEMO_UNITS.find(u => u.id === unitId);
    return unit ? unit.abbreviation : '?';
}

function getSupplierName(supplierId) {
    const supplier = DEMO_SUPPLIERS.find(s => s.id === supplierId);
    return supplier ? supplier.name : 'Unknown';
}

function getUserName(userId) {
    if (userId === 1) return 'Tatay Owner';
    if (userId === 2) return 'Juan Manager';
    if (userId === 3) return 'Maria Stock';
    return 'Unknown';
}

function getPOStatusBadge(status) {
    const statusMap = {
        'draft': { label: 'Draft', class: 'badge-secondary' },
        'pending': { label: 'Pending Approval', class: 'badge-warning' },
        'approved': { label: 'Approved', class: 'badge-info' },
        'rejected': { label: 'Rejected', class: 'badge-danger' },
        'ordered': { label: 'Ordered', class: 'badge-info' },
        'partial': { label: 'Partially Received', class: 'badge-warning' },
        'received': { label: 'Received', class: 'badge-success' },
        'cancelled': { label: 'Cancelled', class: 'badge-secondary' }
    };
    return statusMap[status] || { label: status, class: 'badge-secondary' };
}

function generatePONumber() {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const nextId = Math.max(...DEMO_PURCHASE_ORDERS.map(po => po.id)) + 1;
    return `PO-${dateStr}-${String(nextId).padStart(3, '0')}`;
}

function showToast(title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const iconMap = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    };

    toast.innerHTML = `
        <i class="fas ${iconMap[type]} toast-icon"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ============================================
// AUTHENTICATION
// ============================================

function selectRole(role) {
    selectedRole = role;
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.role === role);
    });

    const user = DEMO_USERS[role];
    document.getElementById('login-email').value = user.email;
}

function handleLogin(event) {
    event.preventDefault();
    currentUser = DEMO_USERS[selectedRole];

    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('app-screen').style.display = 'flex';

    updateUserUI();
    updateSidebarVisibility();
    navigateTo('dashboard');

    showToast('Welcome!', `Logged in as ${currentUser.name}`, 'success');
}

function updateUserUI() {
    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('user-avatar').textContent = currentUser.avatar;
    document.getElementById('user-avatar-large').textContent = currentUser.avatar;
    document.getElementById('user-menu-name').textContent = currentUser.name;
    document.getElementById('user-menu-role').textContent = currentUser.roleLabel;
}

function updateSidebarVisibility() {
    const role = currentUser.role;
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        const page = item.dataset.page;
        let visible = true;

        if (page === 'purchase-orders' && role === 'stock_personnel') {
            visible = false;
        }
        if (page === 'reports' && role === 'stock_personnel') {
            visible = false;
        }
        if (page === 'suppliers' && role === 'stock_personnel') {
            visible = false;
        }
        if (page === 'settings' && role !== 'owner' && role !== 'admin') {
            visible = false;
        }

        item.style.display = visible ? 'flex' : 'none';
    });
}

function logout() {
    currentUser = null;
    document.getElementById('app-screen').style.display = 'none';
    document.getElementById('login-screen').classList.add('active');
    document.getElementById('user-menu').classList.remove('active');
    showToast('Signed Out', 'You have been logged out successfully', 'info');
}

function showProfile() {
    document.getElementById('user-menu').classList.remove('active');
    showToast('Profile', 'Profile page coming soon', 'info');
}

function showSettings() {
    document.getElementById('user-menu').classList.remove('active');
    navigateTo('settings');
}

// ============================================
// NAVIGATION
// ============================================

function navigateTo(page) {
    currentPage = page;

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });

    const mainContent = document.getElementById('main-content');

    switch(page) {
        case 'dashboard':
            renderDashboard(mainContent);
            break;
        case 'inventory':
            renderInventory(mainContent);
            break;
        case 'purchase-orders':
            renderPurchaseOrders(mainContent);
            break;
        case 'daily-count':
            renderDailyCount(mainContent);
            break;
        case 'suppliers':
            renderSuppliers(mainContent);
            break;
        case 'reports':
            renderReports(mainContent);
            break;
        case 'settings':
            renderSettings(mainContent);
            break;
    }

    window.scrollTo(0, 0);
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
}

function toggleNotifications() {
    document.getElementById('notifications-panel').classList.toggle('active');
    renderNotifications();
}

function toggleUserMenu() {
    document.getElementById('user-menu').classList.toggle('active');
}

function markAllRead() {
    DEMO_NOTIFICATIONS.forEach(n => n.is_read = true);
    renderNotifications();
    updateNotificationBadge();
    showToast('Notifications', 'All notifications marked as read', 'success');
}

function updateNotificationBadge() {
    const unread = DEMO_NOTIFICATIONS.filter(n => !n.is_read && n.user_id === currentUser.id).length;
    const badge = document.getElementById('notification-badge');
    badge.textContent = unread;
    badge.style.display = unread > 0 ? 'block' : 'none';
}

function renderNotifications() {
    const list = document.getElementById('notifications-list');
    const userNotifications = DEMO_NOTIFICATIONS.filter(n => n.user_id === currentUser.id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (userNotifications.length === 0) {
        list.innerHTML = '<div class="empty-state"><p>No notifications</p></div>';
        return;
    }

    list.innerHTML = userNotifications.map(n => `
        <div class="notification-item ${n.is_read ? '' : 'unread'}" onclick="handleNotificationClick(${n.id})">
            <div class="notification-item-title">${n.title}</div>
            <div class="notification-item-text">${n.message}</div>
            <div class="notification-item-time">${timeAgo(n.created_at)}</div>
        </div>
    `).join('');
}

function handleNotificationClick(id) {
    const notification = DEMO_NOTIFICATIONS.find(n => n.id === id);
    if (notification) {
        notification.is_read = true;
        updateNotificationBadge();
        renderNotifications();

        if (notification.reference_type === 'purchase_order') {
            navigateTo('purchase-orders');
        } else if (notification.reference_type === 'item') {
            navigateTo('inventory');
        }
    }
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.notifications-dropdown')) {
        document.getElementById('notifications-panel').classList.remove('active');
    }
    if (!e.target.closest('.user-dropdown')) {
        document.getElementById('user-menu').classList.remove('active');
    }
});

// ============================================
// MODAL FUNCTIONS
// ============================================

function openModal(modalId) {
    document.getElementById('modal-overlay').classList.add('active');
    document.getElementById(modalId).classList.add('active');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
}

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// ============================================
// DASHBOARD RENDERER
// ============================================

function renderDashboard(container) {
    const role = currentUser.role;
    const lowStockItems = DEMO_ITEMS.filter(item => item.current_stock <= item.reorder_point);
    const outOfStockItems = DEMO_ITEMS.filter(item => item.current_stock <= 0);
    const pendingPOs = DEMO_PURCHASE_ORDERS.filter(po => po.status === 'pending');
    const approvedPOs = DEMO_PURCHASE_ORDERS.filter(po => po.status === 'approved');
    const todayDiscrepancies = DEMO_DAILY_COUNTS.filter(d => d.count_date === '2026-06-04' && d.discrepancy !== 0);

    let html = `
        <div class="page-header">
            <h1><i class="fas fa-home"></i> Dashboard</h1>
            <div class="page-header-actions">
                ${role !== 'stock_personnel' ? `<button class="btn btn-primary" onclick="openCreatePOModal()">
                    <i class="fas fa-plus"></i> Create PO
                </button>` : ''}
                <button class="btn btn-outline" onclick="navigateTo('daily-count')">
                    <i class="fas fa-clipboard-check"></i> Daily Count
                </button>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-card-title">Total Items</div>
                    <div class="stat-card-icon blue"><i class="fas fa-boxes"></i></div>
                </div>
                <div class="stat-card-value">${DEMO_ITEMS.length}</div>
                <div class="stat-card-change positive">Active inventory</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-card-title">Low Stock</div>
                    <div class="stat-card-icon orange"><i class="fas fa-exclamation-triangle"></i></div>
                </div>
                <div class="stat-card-value" style="color: var(--warning)">${lowStockItems.length}</div>
                <div class="stat-card-change negative">Below reorder point</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-card-title">Out of Stock</div>
                    <div class="stat-card-icon red"><i class="fas fa-times-circle"></i></div>
                </div>
                <div class="stat-card-value" style="color: var(--danger)">${outOfStockItems.length}</div>
                <div class="stat-card-change negative">Need immediate reorder</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-card-title">Pending POs</div>
                    <div class="stat-card-icon blue"><i class="fas fa-file-invoice"></i></div>
                </div>
                <div class="stat-card-value">${pendingPOs.length}</div>
                <div class="stat-card-change">Awaiting approval</div>
            </div>
        </div>
    `;

    // Role-specific sections
    if (role === 'owner') {
        html += renderOwnerDashboard(pendingPOs, todayDiscrepancies);
    } else if (role === 'manager') {
        html += renderManagerDashboard(lowStockItems, pendingPOs);
    } else if (role === 'stock_personnel') {
        html += renderStockPersonnelDashboard(todayDiscrepancies);
    }

    // Common sections
    html += `
        <div class="card" style="margin-top: 24px;">
            <div class="card-header">
                <h2><i class="fas fa-bolt"></i> Quick Actions</h2>
            </div>
            <div class="card-body">
                <div class="quick-actions">
                    <button class="quick-action-btn" onclick="navigateTo('inventory')">
                        <i class="fas fa-search"></i>
                        <span>View Inventory</span>
                    </button>
                    <button class="quick-action-btn" onclick="navigateTo('daily-count')">
                        <i class="fas fa-clipboard-list"></i>
                        <span>Daily Count</span>
                    </button>
                    <button class="quick-action-btn" onclick="navigateTo('purchase-orders')">
                        <i class="fas fa-list-alt"></i>
                        <span>View POs</span>
                    </button>
                    <button class="quick-action-btn" onclick="navigateTo('reports')">
                        <i class="fas fa-chart-pie"></i>
                        <span>Reports</span>
                    </button>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function renderOwnerDashboard(pendingPOs, discrepancies) {
    let html = '';

    if (pendingPOs.length > 0) {
        html += `
            <div class="alert alert-warning">
                <i class="fas fa-bell alert-icon"></i>
                <div class="alert-content">
                    <div class="alert-title">${pendingPOs.length} Purchase Order${pendingPOs.length > 1 ? 's' : ''} Awaiting Your Approval</div>
                    <div class="alert-text">Review and approve purchase orders to keep inventory stocked.</div>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h2><i class="fas fa-clipboard-check"></i> Pending Approvals</h2>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>PO Number</th>
                                    <th>Requester</th>
                                    <th>Items</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${pendingPOs.map(po => {
                                    const poItems = DEMO_PO_ITEMS.filter(pi => pi.po_id === po.id);
                                    const requester = getUserName(po.requester_id);
                                    return `
                                        <tr>
                                            <td><strong>${po.po_number}</strong></td>
                                            <td>${requester}</td>
                                            <td>${poItems.length} items</td>
                                            <td>${getPOStatusBadge(po.status).label}</td>
                                            <td>${formatDate(po.created_at)}</td>
                                            <td>
                                                <button class="btn btn-primary btn-sm" onclick="openApproveModal(${po.id})">
                                                    <i class="fas fa-check"></i> Review
                                                </button>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    if (discrepancies.length > 0) {
        html += `
            <div class="card" style="margin-top: 24px;">
                <div class="card-header">
                    <h2><i class="fas fa-not-equal"></i> Today's Stock Discrepancies</h2>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Expected</th>
                                    <th>Actual</th>
                                    <th>Difference</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${discrepancies.map(d => {
                                    const item = DEMO_ITEMS.find(i => i.id === d.item_id);
                                    return `
                                        <tr>
                                            <td>${item.name}</td>
                                            <td>${d.expected_stock}</td>
                                            <td>${d.actual_count}</td>
                                            <td style="color: ${d.discrepancy < 0 ? 'var(--danger)' : 'var(--success)'}">
                                                ${d.discrepancy > 0 ? '+' : ''}${d.discrepancy}
                                            </td>
                                            <td>
                                                <span class="badge ${d.is_resolved ? 'badge-success' : 'badge-warning'}">
                                                    ${d.is_resolved ? 'Resolved' : 'Pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    return html;
}

function renderManagerDashboard(lowStockItems, pendingPOs) {
    let html = '';

    if (lowStockItems.length > 0) {
        html += `
            <div class="card">
                <div class="card-header">
                    <h2><i class="fas fa-exclamation-triangle"></i> Low Stock Alerts</h2>
                    <button class="btn btn-primary btn-sm" onclick="openCreatePOModal()">
                        <i class="fas fa-plus"></i> Create PO
                    </button>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Current Stock</th>
                                    <th>Reorder Point</th>
                                    <th>Shortage</th>
                                    <th>Supplier</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${lowStockItems.map(item => {
                                    const status = getItemStatus(item);
                                    const shortage = Math.max(0, item.reorder_point - item.current_stock);
                                    return `
                                        <tr>
                                            <td>
                                                <strong>${item.name}</strong>
                                                <div style="font-size: 12px; color: var(--text-muted)">${item.sku}</div>
                                            </td>
                                            <td>
                                                <span class="stock-text ${status.level}">${item.current_stock}</span>
                                            </td>
                                            <td>${item.reorder_point}</td>
                                            <td style="color: var(--danger); font-weight: 600">${shortage}</td>
                                            <td>${getSupplierName(item.supplier_id)}</td>
                                            <td>
                                                <button class="btn btn-outline btn-sm" onclick="addItemToTempPO(${item.id})">
                                                    <i class="fas fa-plus"></i> Add to PO
                                                </button>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    // My Purchase Orders
    const myPOs = DEMO_PURCHASE_ORDERS.filter(po => po.requester_id === currentUser.id).slice(0, 5);
    if (myPOs.length > 0) {
        html += `
            <div class="card" style="margin-top: 24px;">
                <div class="card-header">
                    <h2><i class="fas fa-file-invoice-dollar"></i> My Purchase Orders</h2>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>PO Number</th>
                                    <th>Status</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${myPOs.map(po => {
                                    const poItems = DEMO_PO_ITEMS.filter(pi => pi.po_id === po.id);
                                    const status = getPOStatusBadge(po.status);
                                    return `
                                        <tr>
                                            <td><strong>${po.po_number}</strong></td>
                                            <td><span class="badge ${status.class}">${status.label}</span></td>
                                            <td>${poItems.length} items</td>
                                            <td>${formatCurrency(po.total_amount)}</td>
                                            <td>${formatDate(po.created_at)}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    return html;
}

function renderStockPersonnelDashboard(discrepancies) {
    let html = `
        <div class="card">
            <div class="card-header">
                <h2><i class="fas fa-clipboard-check"></i> Today's Tasks</h2>
            </div>
            <div class="card-body">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle alert-icon"></i>
                    <div class="alert-content">
                        <div class="alert-title">Daily Stock Count</div>
                        <div class="alert-text">Please complete the daily stock count for all items.</div>
                    </div>
                </div>
                <button class="btn btn-primary btn-lg btn-block" onclick="navigateTo('daily-count')">
                    <i class="fas fa-clipboard-list"></i> Start Daily Stock Count
                </button>
            </div>
        </div>
    `;

    if (discrepancies.length > 0) {
        html += `
            <div class="card" style="margin-top: 24px;">
                <div class="card-header">
                    <h2><i class="fas fa-not-equal"></i> Discrepancies to Resolve</h2>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Expected</th>
                                    <th>Actual</th>
                                    <th>Difference</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${discrepancies.filter(d => !d.is_resolved).map(d => {
                                    const item = DEMO_ITEMS.find(i => i.id === d.item_id);
                                    return `
                                        <tr>
                                            <td>${item.name}</td>
                                            <td>${d.expected_stock}</td>
                                            <td>${d.actual_count}</td>
                                            <td style="color: var(--danger); font-weight: 600">${d.discrepancy}</td>
                                            <td>
                                                <button class="btn btn-success btn-sm" onclick="resolveDiscrepancy(${d.id})">
                                                    <i class="fas fa-check"></i> Resolve
                                                </button>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    return html;
}

// ============================================
// INVENTORY RENDERER
// ============================================

function renderInventory(container) {
    let html = `
        <div class="page-header">
            <h1><i class="fas fa-boxes"></i> Inventory</h1>
            <div class="page-header-actions">
                <button class="btn btn-outline" onclick="exportInventory()">
                    <i class="fas fa-download"></i> Export
                </button>
            </div>
        </div>

        <div class="filters-bar">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" id="inventory-search" placeholder="Search items..." onkeyup="filterInventory()">
            </div>
            <select class="filter-select" id="inventory-category" onchange="filterInventory()">
                <option value="">All Categories</option>
                ${DEMO_CATEGORIES.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
            <select class="filter-select" id="inventory-status" onchange="filterInventory()">
                <option value="">All Status</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
                <option value="normal">Normal</option>
            </select>
        </div>

        <div class="card">
            <div class="card-body">
                <div class="table-container">
                    <table class="data-table" id="inventory-table">
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>Item Name</th>
                                <th>Category</th>
                                <th>Stock Level</th>
                                <th>Reorder Point</th>
                                <th>Supplier</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="inventory-tbody">
                            <!-- Populated by JS -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
    filterInventory();
}

function filterInventory() {
    const search = document.getElementById('inventory-search')?.value.toLowerCase() || '';
    const category = document.getElementById('inventory-category')?.value || '';
    const status = document.getElementById('inventory-status')?.value || '';

    let filtered = DEMO_ITEMS.filter(item => item.is_active);

    if (search) {
        filtered = filtered.filter(item => 
            item.name.toLowerCase().includes(search) || 
            item.sku.toLowerCase().includes(search) ||
            item.barcode?.includes(search)
        );
    }

    if (category) {
        filtered = filtered.filter(item => item.category_id === parseInt(category));
    }

    if (status) {
        if (status === 'low') {
            filtered = filtered.filter(item => item.current_stock > 0 && item.current_stock <= item.reorder_point);
        } else if (status === 'out') {
            filtered = filtered.filter(item => item.current_stock <= 0);
        } else if (status === 'normal') {
            filtered = filtered.filter(item => item.current_stock > item.reorder_point);
        }
    }

    const tbody = document.getElementById('inventory-tbody');
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-state"><p>No items found</p></td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(item => {
        const status = getItemStatus(item);
        const stockPct = getStockPercentage(item);
        return `
            <tr>
                <td><code>${item.sku}</code></td>
                <td>
                    <strong>${item.name}</strong>
                    <div style="font-size: 12px; color: var(--text-muted)">${item.description}</div>
                </td>
                <td>${getCategoryName(item.category_id)}</td>
                <td>
                    <div class="stock-level">
                        <div class="stock-bar">
                            <div class="stock-bar-fill ${status.level}" style="width: ${stockPct}%"></div>
                        </div>
                        <span class="stock-text ${status.level}">${item.current_stock} ${getUnitAbbreviation(item.unit_id)}</span>
                    </div>
                </td>
                <td>${item.reorder_point} ${getUnitAbbreviation(item.unit_id)}</td>
                <td>${getSupplierName(item.supplier_id)}</td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="viewItemDetail(${item.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${currentUser.role !== 'stock_personnel' ? `
                        <button class="btn btn-sm btn-outline" onclick="openStockAdjustModal(${item.id})">
                            <i class="fas fa-sliders-h"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

function viewItemDetail(itemId) {
    const item = DEMO_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    const stockLogs = DEMO_STOCK_LOGS.filter(l => l.item_id === itemId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const poItems = DEMO_PO_ITEMS.filter(pi => pi.item_id === itemId);
    const status = getItemStatus(item);

    document.getElementById('item-detail-title').innerHTML = `
        <i class="fas fa-box"></i> ${item.name}
        <span class="badge ${status.class}" style="margin-left: 12px; font-size: 12px;">${status.label}</span>
    `;

    document.getElementById('item-detail-content').innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
            <div>
                <h4 style="margin-bottom: 12px; color: var(--text-secondary); font-size: 13px; text-transform: uppercase;">Item Information</h4>
                <div style="background: var(--bg-secondary); padding: 16px; border-radius: var(--border-radius); font-size: 14px;">
                    <div style="margin-bottom: 8px;"><strong>SKU:</strong> ${item.sku}</div>
                    <div style="margin-bottom: 8px;"><strong>Barcode:</strong> ${item.barcode || 'N/A'}</div>
                    <div style="margin-bottom: 8px;"><strong>Category:</strong> ${getCategoryName(item.category_id)}</div>
                    <div style="margin-bottom: 8px;"><strong>Unit:</strong> ${getUnitName(item.unit_id)}</div>
                    <div style="margin-bottom: 8px;"><strong>Supplier:</strong> ${getSupplierName(item.supplier_id)}</div>
                    <div><strong>Description:</strong> ${item.description}</div>
                </div>
            </div>
            <div>
                <h4 style="margin-bottom: 12px; color: var(--text-secondary); font-size: 13px; text-transform: uppercase;">Stock Configuration</h4>
                <div style="background: var(--bg-secondary); padding: 16px; border-radius: var(--border-radius); font-size: 14px;">
                    <div style="margin-bottom: 8px;"><strong>Current Stock:</strong> <span class="stock-text ${status.level}">${item.current_stock} ${getUnitAbbreviation(item.unit_id)}</span></div>
                    <div style="margin-bottom: 8px;"><strong>Reorder Point:</strong> ${item.reorder_point} ${getUnitAbbreviation(item.unit_id)}</div>
                    <div style="margin-bottom: 8px;"><strong>Reorder Qty:</strong> ${item.reorder_qty} ${getUnitAbbreviation(item.unit_id)}</div>
                    <div style="margin-bottom: 8px;"><strong>Max Stock:</strong> ${item.max_stock} ${getUnitAbbreviation(item.unit_id)}</div>
                    <div style="margin-bottom: 8px;"><strong>Last Purchase Price:</strong> ${formatCurrency(item.last_purchase_price)}</div>
                    <div><strong>Avg Purchase Price:</strong> ${formatCurrency(item.avg_purchase_price)}</div>
                </div>
            </div>
        </div>

        <h4 style="margin-bottom: 12px; color: var(--text-secondary); font-size: 13px; text-transform: uppercase;">Stock History</h4>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Quantity</th>
                        <th>Old Stock</th>
                        <th>New Stock</th>
                        <th>Reason</th>
                        <th>By</th>
                    </tr>
                </thead>
                <tbody>
                    ${stockLogs.length > 0 ? stockLogs.slice(0, 10).map(log => `
                        <tr>
                            <td>${formatDateTime(log.created_at)}</td>
                            <td><span class="badge ${log.type === 'purchase' ? 'badge-success' : log.type === 'sale' ? 'badge-danger' : 'badge-secondary'}">${log.type.replace('_', ' ')}</span></td>
                            <td style="color: ${log.quantity > 0 ? 'var(--success)' : log.quantity < 0 ? 'var(--danger)' : 'var(--text-secondary)'}">${log.quantity > 0 ? '+' : ''}${log.quantity}</td>
                            <td>${log.old_stock}</td>
                            <td>${log.new_stock}</td>
                            <td>${log.reason || '-'}</td>
                            <td>${getUserName(log.user_id)}</td>
                        </tr>
                    `).join('') : '<tr><td colspan="7" class="empty-state"><p>No stock history</p></td></tr>'}
                </tbody>
            </table>
        </div>
    `;

    openModal('item-detail-modal');
}

function openStockAdjustModal(itemId) {
    const item = DEMO_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    currentItemForAdjust = item;
    document.getElementById('adjust-current').value = item.current_stock;
    document.getElementById('adjust-quantity').value = '';
    document.getElementById('adjust-new').value = item.current_stock;
    document.getElementById('adjust-reason').value = '';

    openModal('stock-adjust-modal');
}

function submitStockAdjustment() {
    if (!currentItemForAdjust) return;

    const quantity = parseFloat(document.getElementById('adjust-quantity').value) || 0;
    const type = document.getElementById('adjust-type').value;
    const reason = document.getElementById('adjust-reason').value;

    if (quantity === 0) {
        showToast('Error', 'Please enter a quantity', 'error');
        return;
    }

    const oldStock = currentItemForAdjust.current_stock;
    const newStock = oldStock + quantity;

    if (newStock < 0) {
        showToast('Error', 'Cannot reduce stock below zero', 'error');
        return;
    }

    currentItemForAdjust.current_stock = newStock;

    DEMO_STOCK_LOGS.push({
        id: DEMO_STOCK_LOGS.length + 1,
        item_id: currentItemForAdjust.id,
        user_id: currentUser.id,
        type: type,
        quantity: quantity,
        old_stock: oldStock,
        new_stock: newStock,
        reason: reason,
        created_at: new Date().toISOString()
    });

    closeModal();
    showToast('Success', `Stock adjusted from ${oldStock} to ${newStock}`, 'success');
    filterInventory();
}

// Update new stock when quantity changes
document.addEventListener('input', function(e) {
    if (e.target.id === 'adjust-quantity') {
        const current = parseFloat(document.getElementById('adjust-current').value) || 0;
        const qty = parseFloat(e.target.value) || 0;
        document.getElementById('adjust-new').value = current + qty;
    }
});

function exportInventory() {
    showToast('Export', 'Inventory data exported to CSV', 'success');
}

// ============================================
// PURCHASE ORDERS RENDERER
// ============================================

function renderPurchaseOrders(container) {
    const role = currentUser.role;

    let html = `
        <div class="page-header">
            <h1><i class="fas fa-file-invoice-dollar"></i> Purchase Orders</h1>
            <div class="page-header-actions">
                ${role !== 'stock_personnel' ? `
                    <button class="btn btn-primary" onclick="openCreatePOModal()">
                        <i class="fas fa-plus"></i> Create PO
                    </button>
                ` : ''}
            </div>
        </div>

        <div class="tabs">
            <div class="tab active" data-tab="all" onclick="switchPOTab('all')">All</div>
            <div class="tab" data-tab="pending" onclick="switchPOTab('pending')">Pending</div>
            <div class="tab" data-tab="approved" onclick="switchPOTab('approved')">Approved</div>
            <div class="tab" data-tab="ordered" onclick="switchPOTab('ordered')">Ordered</div>
            <div class="tab" data-tab="received" onclick="switchPOTab('received')">Received</div>
        </div>

        <div class="card">
            <div class="card-body">
                <div class="table-container">
                    <table class="data-table" id="po-table">
                        <thead>
                            <tr>
                                <th>PO Number</th>
                                <th>Requester</th>
                                <th>Supplier</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="po-tbody">
                            <!-- Populated by JS -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
    filterPOs('all');
}

function switchPOTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.tab[data-tab="${tab}"]`)?.classList.add('active');
    filterPOs(tab);
}

function filterPOs(status) {
    let filtered = [...DEMO_PURCHASE_ORDERS];

    if (status !== 'all') {
        filtered = filtered.filter(po => po.status === status);
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const tbody = document.getElementById('po-tbody');
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="empty-state"><p>No purchase orders found</p></td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(po => {
        const poItems = DEMO_PO_ITEMS.filter(pi => pi.po_id === po.id);
        const status = getPOStatusBadge(po.status);
        const canApprove = currentUser.role === 'owner' && po.status === 'pending';
        const canReceive = (currentUser.role === 'owner' || currentUser.role === 'manager') && (po.status === 'approved' || po.status === 'ordered');
        const canView = true;

        return `
            <tr>
                <td><strong>${po.po_number}</strong></td>
                <td>${getUserName(po.requester_id)}</td>
                <td>${getSupplierName(po.supplier_id)}</td>
                <td>${poItems.length} items</td>
                <td>${formatCurrency(po.total_amount)}</td>
                <td><span class="badge ${status.class}"><span class="badge-dot"></span>${status.label}</span></td>
                <td>${formatDate(po.created_at)}</td>
                <td>
                    ${canApprove ? `
                        <button class="btn btn-sm btn-primary" onclick="openApproveModal(${po.id})">
                            <i class="fas fa-check"></i> Review
                        </button>
                    ` : ''}
                    ${canReceive ? `
                        <button class="btn btn-sm btn-success" onclick="openReceiveModal(${po.id})">
                            <i class="fas fa-box-open"></i> Receive
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-outline" onclick="viewPODetail(${po.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function viewPODetail(poId) {
    const po = DEMO_PURCHASE_ORDERS.find(p => p.id === poId);
    if (!po) return;

    const poItems = DEMO_PO_ITEMS.filter(pi => pi.po_id === poId);
    const status = getPOStatusBadge(po.status);

    document.getElementById('item-detail-title').innerHTML = `
        <i class="fas fa-file-invoice-dollar"></i> ${po.po_number}
        <span class="badge ${status.class}" style="margin-left: 12px; font-size: 12px;">${status.label}</span>
    `;

    document.getElementById('item-detail-content').innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
            <div>
                <h4 style="margin-bottom: 12px; color: var(--text-secondary); font-size: 13px; text-transform: uppercase;">Order Information</h4>
                <div style="background: var(--bg-secondary); padding: 16px; border-radius: var(--border-radius); font-size: 14px;">
                    <div style="margin-bottom: 8px;"><strong>Requester:</strong> ${getUserName(po.requester_id)}</div>
                    <div style="margin-bottom: 8px;"><strong>Approver:</strong> ${po.approver_id ? getUserName(po.approver_id) : 'Not yet approved'}</div>
                    <div style="margin-bottom: 8px;"><strong>Supplier:</strong> ${getSupplierName(po.supplier_id)}</div>
                    <div style="margin-bottom: 8px;"><strong>Created:</strong> ${formatDateTime(po.created_at)}</div>
                    <div><strong>Notes:</strong> ${po.requester_notes || 'No notes'}</div>
                </div>
            </div>
            <div>
                <h4 style="margin-bottom: 12px; color: var(--text-secondary); font-size: 13px; text-transform: uppercase;">Timeline</h4>
                <div class="timeline">
                    <div class="timeline-item">
                        <div class="timeline-dot completed"></div>
                        <div class="timeline-content">
                            <div class="timeline-title">Created</div>
                            <div class="timeline-meta">${formatDateTime(po.created_at)} by ${getUserName(po.requester_id)}</div>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-dot ${po.submitted_at ? 'completed' : ''}"></div>
                        <div class="timeline-content">
                            <div class="timeline-title">Submitted</div>
                            <div class="timeline-meta">${po.submitted_at ? formatDateTime(po.submitted_at) : 'Pending'}</div>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-dot ${po.approved_at ? 'completed' : po.rejected_at ? 'completed' : po.status === 'pending' ? 'current' : ''}"></div>
                        <div class="timeline-content">
                            <div class="timeline-title">${po.rejected_at ? 'Rejected' : 'Approved'}</div>
                            <div class="timeline-meta">${po.approved_at ? formatDateTime(po.approved_at) + ' by ' + getUserName(po.approver_id) : po.rejected_at ? formatDateTime(po.rejected_at) : 'Pending'}</div>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-dot ${po.ordered_at ? 'completed' : ''}"></div>
                        <div class="timeline-content">
                            <div class="timeline-title">Ordered from Supplier</div>
                            <div class="timeline-meta">${po.ordered_at ? formatDateTime(po.ordered_at) : 'Pending'}</div>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-dot ${po.received_at ? 'completed' : ''}"></div>
                        <div class="timeline-content">
                            <div class="timeline-title">Received</div>
                            <div class="timeline-meta">${po.received_at ? formatDateTime(po.received_at) : 'Pending'}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <h4 style="margin-bottom: 12px; color: var(--text-secondary); font-size: 13px; text-transform: uppercase;">Items</h4>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Requested</th>
                        <th>Approved</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                        <th>Received</th>
                    </tr>
                </thead>
                <tbody>
                    ${poItems.map(pi => {
                        const item = DEMO_ITEMS.find(i => i.id === pi.item_id);
                        return `
                            <tr>
                                <td>
                                    <strong>${item.name}</strong>
                                    <div style="font-size: 12px; color: var(--text-muted)">${item.sku}</div>
                                </td>
                                <td>${pi.requested_qty} ${getUnitAbbreviation(item.unit_id)}</td>
                                <td>${pi.approved_qty || '-'} ${pi.approved_qty ? getUnitAbbreviation(item.unit_id) : ''}</td>
                                <td>${pi.unit_price ? formatCurrency(pi.unit_price) : '-'}</td>
                                <td>${pi.total_price ? formatCurrency(pi.total_price) : '-'}</td>
                                <td>${pi.received_qty} ${getUnitAbbreviation(item.unit_id)}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>

        ${po.total_amount > 0 ? `
            <div style="margin-top: 20px; text-align: right; font-size: 16px;">
                <strong>Total Amount: ${formatCurrency(po.total_amount)}</strong>
            </div>
        ` : ''}
    `;

    openModal('item-detail-modal');
}

// ============================================
// CREATE PO MODAL
// ============================================

function openCreatePOModal() {
    tempPOItems = [];

    const supplierSelect = document.getElementById('po-supplier');
    supplierSelect.innerHTML = '<option value="">Select Supplier</option>' + 
        DEMO_SUPPLIERS.filter(s => s.is_active).map(s => `<option value="${s.id}">${s.name}</option>`).join('');

    document.getElementById('po-delivery-date').value = '';
    document.getElementById('po-notes').value = '';
    updatePOItemsList();

    openModal('create-po-modal');
}

function updatePOItemsList() {
    const list = document.getElementById('po-items-list');
    if (tempPOItems.length === 0) {
        list.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No items added yet. Click "Add Item" to add items to this order.</p>';
        return;
    }

    list.innerHTML = tempPOItems.map((item, index) => {
        const dbItem = DEMO_ITEMS.find(i => i.id === item.item_id);
        return `
            <div class="po-item-row">
                <div class="po-item-row-name">
                    <strong>${dbItem.name}</strong>
                    <div style="font-size: 11px; color: var(--text-muted)">${dbItem.sku}</div>
                </div>
                <div class="po-item-row-qty">
                    <input type="number" class="form-control" value="${item.qty}" min="1" 
                        onchange="updatePOItemQty(${index}, this.value)" style="width: 80px; text-align: center;">
                    <span style="font-size: 12px; color: var(--text-muted)">${getUnitAbbreviation(dbItem.unit_id)}</span>
                </div>
                <div class="po-item-row-price">
                    <input type="text" class="form-control" value="${item.notes}" placeholder="Notes"
                        onchange="updatePOItemNotes(${index}, this.value)" style="font-size: 12px;">
                </div>
                <div class="po-item-row-remove" onclick="removePOItem(${index})">
                    <i class="fas fa-trash-alt"></i>
                </div>
            </div>
        `;
    }).join('');
}

function updatePOItemQty(index, qty) {
    tempPOItems[index].qty = parseFloat(qty) || 1;
}

function updatePOItemNotes(index, notes) {
    tempPOItems[index].notes = notes;
}

function removePOItem(index) {
    tempPOItems.splice(index, 1);
    updatePOItemsList();
}

function showAddItemToPO() {
    document.getElementById('po-item-search').value = '';
    document.getElementById('po-item-search-results').innerHTML = '';
    openModal('add-item-po-modal');
}

function closeAddItemModal() {
    document.getElementById('add-item-po-modal').classList.remove('active');
}

function searchItemsForPO() {
    const search = document.getElementById('po-item-search').value.toLowerCase();
    const results = document.getElementById('po-item-search-results');

    if (search.length < 1) {
        results.innerHTML = '';
        return;
    }

    const filtered = DEMO_ITEMS.filter(item => 
        item.is_active && 
        !tempPOItems.some(ti => ti.item_id === item.id) &&
        (item.name.toLowerCase().includes(search) || item.sku.toLowerCase().includes(search))
    ).slice(0, 10);

    if (filtered.length === 0) {
        results.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--text-muted);">No items found</div>';
        return;
    }

    results.innerHTML = filtered.map(item => {
        const status = getItemStatus(item);
        return `
            <div class="po-search-result-item" onclick="addItemToTempPO(${item.id})">
                <div class="po-search-result-info">
                    <h4>${item.name}</h4>
                    <p>${item.sku} - ${getCategoryName(item.category_id)}</p>
                </div>
                <div class="po-search-result-stock">
                    <div class="stock-label">Stock</div>
                    <div class="stock-value ${status.level}">${item.current_stock}</div>
                </div>
            </div>
        `;
    }).join('');
}

function addItemToTempPO(itemId) {
    const item = DEMO_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    tempPOItems.push({
        item_id: itemId,
        qty: item.reorder_qty || 10,
        notes: ''
    });

    closeAddItemModal();
    updatePOItemsList();
    showToast('Item Added', `${item.name} added to purchase order`, 'success');
}

function submitPO() {
    const supplierId = document.getElementById('po-supplier').value;
    const deliveryDate = document.getElementById('po-delivery-date').value;
    const notes = document.getElementById('po-notes').value;

    if (!supplierId) {
        showToast('Error', 'Please select a supplier', 'error');
        return;
    }

    if (tempPOItems.length === 0) {
        showToast('Error', 'Please add at least one item', 'error');
        return;
    }

    const newPO = {
        id: Math.max(...DEMO_PURCHASE_ORDERS.map(po => po.id)) + 1,
        po_number: generatePONumber(),
        requester_id: currentUser.id,
        requester_notes: notes,
        approver_id: null,
        approval_notes: null,
        supplier_id: parseInt(supplierId),
        status: 'pending',
        subtotal: 0,
        tax_amount: 0,
        total_amount: 0,
        created_at: new Date().toISOString(),
        submitted_at: new Date().toISOString(),
        approved_at: null,
        rejected_at: null,
        ordered_at: null,
        expected_delivery: deliveryDate,
        received_at: null
    };

    DEMO_PURCHASE_ORDERS.push(newPO);

    tempPOItems.forEach((ti, index) => {
        DEMO_PO_ITEMS.push({
            id: Math.max(...DEMO_PO_ITEMS.map(pi => pi.id)) + 1 + index,
            po_id: newPO.id,
            item_id: ti.item_id,
            requested_qty: ti.qty,
            approved_qty: null,
            unit_price: null,
            total_price: null,
            received_qty: 0,
            notes: ti.notes
        });
    });

    // Add notification for owner
    DEMO_NOTIFICATIONS.push({
        id: Math.max(...DEMO_NOTIFICATIONS.map(n => n.id)) + 1,
        user_id: 1, // Owner
        type: 'po_pending',
        title: 'New PO Request',
        message: `${currentUser.name} submitted ${newPO.po_number} for approval`,
        reference_id: newPO.id,
        reference_type: 'purchase_order',
        is_read: false,
        created_at: new Date().toISOString()
    });

    closeModal();
    showToast('Success', `Purchase Order ${newPO.po_number} created and submitted for approval`, 'success');

    if (currentPage === 'purchase-orders') {
        filterPOs('all');
    } else if (currentPage === 'dashboard') {
        navigateTo('dashboard');
    }

    updateNotificationBadge();
}

// ============================================
// APPROVE PO MODAL
// ============================================

function openApproveModal(poId) {
    const po = DEMO_PURCHASE_ORDERS.find(p => p.id === poId);
    if (!po) return;

    currentPOForApproval = po;
    const poItems = DEMO_PO_ITEMS.filter(pi => pi.po_id === poId);

    const content = document.getElementById('approve-po-content');
    content.innerHTML = `
        <div class="alert alert-info">
            <i class="fas fa-info-circle alert-icon"></i>
            <div class="alert-content">
                <div class="alert-title">Review Stock Before Approving</div>
                <div class="alert-text">Check current stock levels for each item and adjust quantities if needed.</div>
            </div>
        </div>

        <div style="margin-bottom: 16px;">
            <strong>Requester:</strong> ${getUserName(po.requester_id)}<br>
            <strong>Supplier:</strong> ${getSupplierName(po.supplier_id)}<br>
            <strong>Notes:</strong> ${po.requester_notes || 'No notes'}
        </div>

        <div style="margin-bottom: 16px;">
            <label style="font-weight: 500; margin-bottom: 8px; display: block;">Approval Notes</label>
            <textarea id="approval-notes" class="form-control" rows="2" placeholder="Add your notes here..."></textarea>
        </div>

        <div style="margin-bottom: 16px;">
            <label style="font-weight: 500; margin-bottom: 8px; display: block;">Expected Delivery Date</label>
            <input type="date" id="approval-delivery-date" class="form-control" value="${po.expected_delivery || ''}">
        </div>

        <h4 style="margin-bottom: 12px;">Items to Approve</h4>
        ${poItems.map(pi => {
            const item = DEMO_ITEMS.find(i => i.id === pi.item_id);
            const status = getItemStatus(item);
            return `
                <div class="approval-item-row" data-item-id="${pi.item_id}">
                    <div class="approval-item-info">
                        <h4>${item.name}</h4>
                        <div class="stock-info">
                            Current: <span class="stock-text ${status.level}">${item.current_stock}</span> | 
                            Reorder Point: ${item.reorder_point} | 
                            Max: ${item.max_stock}
                        </div>
                    </div>
                    <div class="approval-item-input">
                        <label>Requested</label>
                        <div style="font-weight: 600;">${pi.requested_qty}</div>
                    </div>
                    <div class="approval-item-input">
                        <label>Approve Qty</label>
                        <input type="number" class="approve-qty" value="${pi.requested_qty}" min="0" data-item="${pi.item_id}">
                    </div>
                    <div class="approval-item-input">
                        <label>Unit Price (P)</label>
                        <input type="number" class="approve-price" value="${item.last_purchase_price || ''}" min="0" step="0.01" data-item="${pi.item_id}">
                    </div>
                    <div class="approval-item-input">
                        <label>Total</label>
                        <div class="approve-total" style="font-weight: 600;" data-item="${pi.item_id}">
                            ${formatCurrency((pi.requested_qty * (item.last_purchase_price || 0)))}
                        </div>
                    </div>
                </div>
            `;
        }).join('')}
    `;

    // Add event listeners for price/quantity updates
    setTimeout(() => {
        document.querySelectorAll('.approve-qty, .approve-price').forEach(input => {
            input.addEventListener('input', updateApprovalTotals);
        });
    }, 100);

    openModal('approve-po-modal');
}

function updateApprovalTotals() {
    document.querySelectorAll('.approval-item-row').forEach(row => {
        const itemId = row.dataset.itemId;
        const qty = parseFloat(row.querySelector('.approve-qty').value) || 0;
        const price = parseFloat(row.querySelector('.approve-price').value) || 0;
        const total = qty * price;
        row.querySelector('.approve-total').textContent = formatCurrency(total);
    });
}

function approvePO() {
    if (!currentPOForApproval) return;

    const notes = document.getElementById('approval-notes').value;
    const deliveryDate = document.getElementById('approval-delivery-date').value;

    let totalAmount = 0;

    document.querySelectorAll('.approval-item-row').forEach(row => {
        const itemId = parseInt(row.dataset.itemId);
        const qty = parseFloat(row.querySelector('.approve-qty').value) || 0;
        const price = parseFloat(row.querySelector('.approve-price').value) || 0;
        const total = qty * price;

        const poItem = DEMO_PO_ITEMS.find(pi => pi.po_id === currentPOForApproval.id && pi.item_id === itemId);
        if (poItem) {
            poItem.approved_qty = qty;
            poItem.unit_price = price;
            poItem.total_price = total;
        }

        totalAmount += total;
    });

    currentPOForApproval.status = 'approved';
    currentPOForApproval.approver_id = currentUser.id;
    currentPOForApproval.approval_notes = notes;
    currentPOForApproval.approved_at = new Date().toISOString();
    currentPOForApproval.total_amount = totalAmount;
    currentPOForApproval.expected_delivery = deliveryDate;

    // Add notification for requester
    DEMO_NOTIFICATIONS.push({
        id: Math.max(...DEMO_NOTIFICATIONS.map(n => n.id)) + 1,
        user_id: currentPOForApproval.requester_id,
        type: 'po_approved',
        title: 'PO Approved',
        message: `Your ${currentPOForApproval.po_number} has been approved by ${currentUser.name}`,
        reference_id: currentPOForApproval.id,
        reference_type: 'purchase_order',
        is_read: false,
        created_at: new Date().toISOString()
    });

    closeModal();
    showToast('Approved', `Purchase Order ${currentPOForApproval.po_number} has been approved`, 'success');

    if (currentPage === 'purchase-orders') {
        filterPOs('all');
    } else if (currentPage === 'dashboard') {
        navigateTo('dashboard');
    }

    currentPOForApproval = null;
}

function rejectPO() {
    if (!currentPOForApproval) return;

    const notes = document.getElementById('approval-notes').value;

    currentPOForApproval.status = 'rejected';
    currentPOForApproval.approver_id = currentUser.id;
    currentPOForApproval.approval_notes = notes;
    currentPOForApproval.rejected_at = new Date().toISOString();

    // Add notification for requester
    DEMO_NOTIFICATIONS.push({
        id: Math.max(...DEMO_NOTIFICATIONS.map(n => n.id)) + 1,
        user_id: currentPOForApproval.requester_id,
        type: 'po_rejected',
        title: 'PO Rejected',
        message: `Your ${currentPOForApproval.po_number} has been rejected by ${currentUser.name}`,
        reference_id: currentPOForApproval.id,
        reference_type: 'purchase_order',
        is_read: false,
        created_at: new Date().toISOString()
    });

    closeModal();
    showToast('Rejected', `Purchase Order ${currentPOForApproval.po_number} has been rejected`, 'warning');

    if (currentPage === 'purchase-orders') {
        filterPOs('all');
    } else if (currentPage === 'dashboard') {
        navigateTo('dashboard');
    }

    currentPOForApproval = null;
}

// ============================================
// RECEIVE PO MODAL
// ============================================

function openReceiveModal(poId) {
    const po = DEMO_PURCHASE_ORDERS.find(p => p.id === poId);
    if (!po) return;

    currentPOForReceive = po;
    const poItems = DEMO_PO_ITEMS.filter(pi => pi.po_id === poId);

    const content = document.getElementById('receive-po-content');
    content.innerHTML = `
        <div class="alert alert-success">
            <i class="fas fa-info-circle alert-icon"></i>
            <div class="alert-content">
                <div class="alert-title">Confirm Receipt & Update Inventory</div>
                <div class="alert-text">Enter the actual quantities received. Inventory will be automatically updated.</div>
            </div>
        </div>

        <div style="margin-bottom: 16px;">
            <strong>PO Number:</strong> ${po.po_number}<br>
            <strong>Supplier:</strong> ${getSupplierName(po.supplier_id)}<br>
            <strong>Expected Delivery:</strong> ${po.expected_delivery || 'Not specified'}
        </div>

        <div style="margin-bottom: 16px;">
            <label style="font-weight: 500; margin-bottom: 8px; display: block;">Receipt Notes</label>
            <textarea id="receive-notes" class="form-control" rows="2" placeholder="Condition of items, any issues..."></textarea>
        </div>

        <h4 style="margin-bottom: 12px;">Items Received</h4>
        ${poItems.map(pi => {
            const item = DEMO_ITEMS.find(i => i.id === pi.item_id);
            return `
                <div class="receive-item-row" data-item-id="${pi.item_id}">
                    <div class="approval-item-info">
                        <h4>${item.name}</h4>
                        <div class="stock-info">
                            Approved: ${pi.approved_qty || pi.requested_qty} ${getUnitAbbreviation(item.unit_id)} | 
                            Current Stock: ${item.current_stock}
                        </div>
                    </div>
                    <div class="approval-item-input">
                        <label>Qty Received</label>
                        <input type="number" class="receive-qty" value="${pi.approved_qty || pi.requested_qty}" min="0" data-item="${pi.item_id}">
                    </div>
                    <div class="approval-item-input">
                        <label>Unit Price</label>
                        <input type="number" class="receive-price" value="${pi.unit_price || item.last_purchase_price || 0}" min="0" step="0.01" data-item="${pi.item_id}">
                    </div>
                    <div class="approval-item-input">
                        <label>Batch No</label>
                        <input type="text" class="receive-batch" placeholder="Optional" data-item="${pi.item_id}">
                    </div>
                    <div class="approval-item-input">
                        <label>Expiry Date</label>
                        <input type="date" class="receive-expiry" data-item="${pi.item_id}">
                    </div>
                </div>
            `;
        }).join('')}
    `;

    openModal('receive-po-modal');
}

function confirmReceivePO() {
    if (!currentPOForReceive) return;

    const notes = document.getElementById('receive-notes').value;
    let allReceived = true;
    let anyReceived = false;

    document.querySelectorAll('.receive-item-row').forEach(row => {
        const itemId = parseInt(row.dataset.itemId);
        const receivedQty = parseFloat(row.querySelector('.receive-qty').value) || 0;
        const price = parseFloat(row.querySelector('.receive-price').value) || 0;

        const poItem = DEMO_PO_ITEMS.find(pi => pi.po_id === currentPOForReceive.id && pi.item_id === itemId);
        if (poItem) {
            poItem.received_qty = receivedQty;
            poItem.unit_price = price;
            poItem.total_price = receivedQty * price;
        }

        if (receivedQty > 0) {
            anyReceived = true;
            const item = DEMO_ITEMS.find(i => i.id === itemId);
            const oldStock = item.current_stock;
            item.current_stock = oldStock + receivedQty;
            item.last_purchase_price = price;

            // Add stock log
            DEMO_STOCK_LOGS.push({
                id: DEMO_STOCK_LOGS.length + 1,
                item_id: itemId,
                user_id: currentUser.id,
                type: 'purchase',
                quantity: receivedQty,
                old_stock: oldStock,
                new_stock: item.current_stock,
                reason: `PO ${currentPOForReceive.po_number} received`,
                po_id: currentPOForReceive.id,
                reference_no: currentPOForReceive.po_number,
                created_at: new Date().toISOString()
            });
        }

        if (receivedQty < (poItem?.approved_qty || poItem?.requested_qty || 0)) {
            allReceived = false;
        }
    });

    if (!anyReceived) {
        showToast('Error', 'Please enter at least one received quantity', 'error');
        return;
    }

    currentPOForReceive.status = allReceived ? 'received' : 'partial';
    currentPOForReceive.received_at = new Date().toISOString();

    // Recalculate total
    const poItems = DEMO_PO_ITEMS.filter(pi => pi.po_id === currentPOForReceive.id);
    currentPOForReceive.total_amount = poItems.reduce((sum, pi) => sum + (pi.total_price || 0), 0);

    // Add notification for requester
    DEMO_NOTIFICATIONS.push({
        id: Math.max(...DEMO_NOTIFICATIONS.map(n => n.id)) + 1,
        user_id: currentPOForReceive.requester_id,
        type: 'po_received',
        title: 'PO Received',
        message: `${currentPOForReceive.po_number} has been received and inventory updated`,
        reference_id: currentPOForReceive.id,
        reference_type: 'purchase_order',
        is_read: false,
        created_at: new Date().toISOString()
    });

    closeModal();
    showToast('Success', `Purchase Order ${currentPOForReceive.po_number} received. Inventory updated.`, 'success');

    if (currentPage === 'purchase-orders') {
        filterPOs('all');
    } else if (currentPage === 'dashboard') {
        navigateTo('dashboard');
    } else if (currentPage === 'inventory') {
        filterInventory();
    }

    currentPOForReceive = null;
}

// ============================================
// DAILY STOCK COUNT RENDERER
// ============================================

function renderDailyCount(container) {
    const today = '2026-06-04';
    const countedItems = DEMO_DAILY_COUNTS.filter(d => d.count_date === today).map(d => d.item_id);
    const totalItems = DEMO_ITEMS.filter(i => i.is_active).length;
    const countedCount = countedItems.length;

    let html = `
        <div class="page-header">
            <h1><i class="fas fa-clipboard-check"></i> Daily Stock Count</h1>
            <div class="page-header-actions">
                <button class="btn btn-primary" onclick="submitDailyCount()">
                    <i class="fas fa-save"></i> Submit Counts
                </button>
            </div>
        </div>

        <div class="card" style="margin-bottom: 24px;">
            <div class="card-body">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <span style="font-weight: 500;">Progress: ${countedCount}/${totalItems} items counted</span>
                    <span style="font-weight: 600; color: var(--primary);">${Math.round((countedCount/totalItems)*100)}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-bar-fill" style="width: ${(countedCount/totalItems)*100}%"></div>
                </div>
            </div>
        </div>

        <div class="filters-bar">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" id="count-search" placeholder="Search items..." onkeyup="filterDailyCount()">
            </div>
            <select class="filter-select" id="count-category" onchange="filterDailyCount()">
                <option value="">All Categories</option>
                ${DEMO_CATEGORIES.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
        </div>

        <div class="card">
            <div class="card-body">
                <div id="daily-count-list">
                    <!-- Populated by JS -->
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
    renderDailyCountItems();
}

function renderDailyCountItems() {
    const list = document.getElementById('daily-count-list');
    if (!list) return;

    const search = document.getElementById('count-search')?.value.toLowerCase() || '';
    const category = document.getElementById('count-category')?.value || '';
    const today = '2026-06-04';

    let items = DEMO_ITEMS.filter(i => i.is_active);

    if (search) {
        items = items.filter(item => 
            item.name.toLowerCase().includes(search) || 
            item.sku.toLowerCase().includes(search)
        );
    }

    if (category) {
        items = items.filter(item => item.category_id === parseInt(category));
    }

    if (items.length === 0) {
        list.innerHTML = '<div class="empty-state"><p>No items found</p></div>';
        return;
    }

    list.innerHTML = `
        <div class="daily-count-item" style="font-weight: 600; background: var(--bg-secondary); border-radius: var(--border-radius); margin-bottom: 8px;">
            <div>Item</div>
            <div style="text-align: center;">System Stock</div>
            <div style="text-align: center;">Actual Count</div>
            <div style="text-align: center;">Difference</div>
            <div style="text-align: center;">Status</div>
            <div></div>
        </div>
        ${items.map(item => {
            const existingCount = DEMO_DAILY_COUNTS.find(d => d.item_id === item.id && d.count_date === today);
            const actualCount = existingCount ? existingCount.actual_count : '';
            const discrepancy = existingCount ? existingCount.discrepancy : 0;
            const hasDiscrepancy = discrepancy !== 0;
            const isCounted = existingCount !== undefined;

            return `
                <div class="daily-count-item" data-item-id="${item.id}">
                    <div>
                        <div class="daily-count-item-name">${item.name}</div>
                        <div class="daily-count-item-sku">${item.sku}</div>
                    </div>
                    <div style="text-align: center; font-weight: 500;">
                        ${item.current_stock}
                    </div>
                    <div>
                        <input type="number" 
                            class="daily-count-input" 
                            value="${actualCount}" 
                            placeholder="Enter count"
                            onchange="updateDailyCount(${item.id}, this.value)"
                            style="width: 100%; text-align: center;">
                    </div>
                    <div style="text-align: center; font-weight: 600; color: ${hasDiscrepancy ? (discrepancy < 0 ? 'var(--danger)' : 'var(--success)') : 'var(--text-secondary)'}">
                        ${isCounted ? (discrepancy > 0 ? '+' : '') + discrepancy : '-'}
                    </div>
                    <div style="text-align: center;">
                        ${isCounted ? 
                            (hasDiscrepancy ? 
                                '<span style="color: var(--warning);"><i class="fas fa-exclamation-triangle"></i></span>' : 
                                '<span style="color: var(--success);"><i class="fas fa-check-circle"></i></span>') 
                            : '<span style="color: var(--text-muted);"><i class="fas fa-minus-circle"></i></span>'}
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline" onclick="viewItemDetail(${item.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('')}
    `;
}

function filterDailyCount() {
    renderDailyCountItems();
}

function updateDailyCount(itemId, value) {
    const item = DEMO_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    const actualCount = parseFloat(value);
    if (isNaN(actualCount)) return;

    const today = '2026-06-04';
    const expectedStock = item.current_stock;
    const discrepancy = actualCount - expectedStock;

    const existingIndex = DEMO_DAILY_COUNTS.findIndex(d => d.item_id === itemId && d.count_date === today);

    if (existingIndex >= 0) {
        DEMO_DAILY_COUNTS[existingIndex].actual_count = actualCount;
        DEMO_DAILY_COUNTS[existingIndex].discrepancy = discrepancy;
        DEMO_DAILY_COUNTS[existingIndex].expected_stock = expectedStock;
    } else {
        DEMO_DAILY_COUNTS.push({
            id: DEMO_DAILY_COUNTS.length + 1,
            item_id: itemId,
            user_id: currentUser.id,
            count_date: today,
            expected_stock: expectedStock,
            actual_count: actualCount,
            discrepancy: discrepancy,
            notes: '',
            is_resolved: false,
            resolution_note: '',
            created_at: new Date().toISOString()
        });
    }

    // If there's a discrepancy, update actual stock
    if (discrepancy !== 0) {
        const oldStock = item.current_stock;
        item.current_stock = actualCount;

        DEMO_STOCK_LOGS.push({
            id: DEMO_STOCK_LOGS.length + 1,
            item_id: itemId,
            user_id: currentUser.id,
            type: 'daily_count',
            quantity: discrepancy,
            old_stock: oldStock,
            new_stock: actualCount,
            reason: 'Daily stock count adjustment',
            expected_stock: expectedStock,
            actual_count: actualCount,
            discrepancy: discrepancy,
            created_at: new Date().toISOString()
        });

        // Add notification for discrepancy
        if (Math.abs(discrepancy) >= 2) {
            DEMO_NOTIFICATIONS.push({
                id: Math.max(...DEMO_NOTIFICATIONS.map(n => n.id)) + 1,
                user_id: 1, // Owner
                type: 'low_stock',
                title: 'Stock Discrepancy Alert',
                message: `${item.name} count shows ${Math.abs(discrepancy)} unit${Math.abs(discrepancy) > 1 ? 's' : ''} ${discrepancy > 0 ? 'more' : 'less'} than expected`,
                reference_id: itemId,
                reference_type: 'item',
                is_read: false,
                created_at: new Date().toISOString()
            });
            updateNotificationBadge();
        }
    }

    renderDailyCountItems();

    if (discrepancy !== 0) {
        showToast('Discrepancy Found', `${item.name}: ${discrepancy > 0 ? '+' : ''}${discrepancy} units difference`, 'warning');
    }
}

function submitDailyCount() {
    const today = '2026-06-04';
    const countedItems = DEMO_DAILY_COUNTS.filter(d => d.count_date === today);
    const discrepancies = countedItems.filter(d => d.discrepancy !== 0);

    showToast('Daily Count Submitted', `${countedItems.length} items counted, ${discrepancies.length} discrepancies found`, 'success');
    navigateTo('dashboard');
}

function resolveDiscrepancy(countId) {
    const count = DEMO_DAILY_COUNTS.find(d => d.id === countId);
    if (!count) return;

    count.is_resolved = true;
    count.resolution_note = 'Resolved by stock personnel';

    showToast('Resolved', 'Discrepancy marked as resolved', 'success');
    navigateTo('dashboard');
}

// ============================================
// SUPPLIERS RENDERER
// ============================================

function renderSuppliers(container) {
    let html = `
        <div class="page-header">
            <h1><i class="fas fa-truck"></i> Suppliers</h1>
            <div class="page-header-actions">
                <button class="btn btn-primary" onclick="showToast('Coming Soon', 'Add supplier functionality will be available soon', 'info')">
                    <i class="fas fa-plus"></i> Add Supplier
                </button>
            </div>
        </div>

        <div class="filters-bar">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" id="supplier-search" placeholder="Search suppliers..." onkeyup="filterSuppliers()">
            </div>
        </div>

        <div class="card">
            <div class="card-body">
                <div class="table-container">
                    <table class="data-table" id="supplier-table">
                        <thead>
                            <tr>
                                <th>Supplier Name</th>
                                <th>Contact Person</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Address</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="supplier-tbody">
                            <!-- Populated by JS -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
    filterSuppliers();
}

function filterSuppliers() {
    const search = document.getElementById('supplier-search')?.value.toLowerCase() || '';

    let filtered = DEMO_SUPPLIERS.filter(s => s.is_active);

    if (search) {
        filtered = filtered.filter(s => 
            s.name.toLowerCase().includes(search) || 
            s.contact_person.toLowerCase().includes(search) ||
            s.email.toLowerCase().includes(search)
        );
    }

    const tbody = document.getElementById('supplier-tbody');
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-state"><p>No suppliers found</p></td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(supplier => {
        const poCount = DEMO_PURCHASE_ORDERS.filter(po => po.supplier_id === supplier.id).length;
        return `
            <tr>
                <td>
                    <strong>${supplier.name}</strong>
                    <div style="font-size: 12px; color: var(--text-muted)">${poCount} purchase orders</div>
                </td>
                <td>${supplier.contact_person}</td>
                <td>${supplier.email}</td>
                <td>${supplier.phone}</td>
                <td>${supplier.address}</td>
                <td><span class="badge badge-success">Active</span></td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="viewSupplierItems(${supplier.id})">
                        <i class="fas fa-boxes"></i> Items
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function viewSupplierItems(supplierId) {
    const supplier = DEMO_SUPPLIERS.find(s => s.id === supplierId);
    const items = DEMO_ITEMS.filter(i => i.supplier_id === supplierId && i.is_active);
    const pos = DEMO_PURCHASE_ORDERS.filter(po => po.supplier_id === supplierId);

    document.getElementById('item-detail-title').innerHTML = `
        <i class="fas fa-truck"></i> ${supplier.name}
    `;

    document.getElementById('item-detail-content').innerHTML = `
        <div style="margin-bottom: 24px;">
            <h4 style="margin-bottom: 12px; color: var(--text-secondary); font-size: 13px; text-transform: uppercase;">Supplier Information</h4>
            <div style="background: var(--bg-secondary); padding: 16px; border-radius: var(--border-radius); font-size: 14px;">
                <div style="margin-bottom: 8px;"><strong>Contact:</strong> ${supplier.contact_person}</div>
                <div style="margin-bottom: 8px;"><strong>Email:</strong> ${supplier.email}</div>
                <div style="margin-bottom: 8px;"><strong>Phone:</strong> ${supplier.phone}</div>
                <div><strong>Address:</strong> ${supplier.address}</div>
            </div>
        </div>

        <h4 style="margin-bottom: 12px; color: var(--text-secondary); font-size: 13px; text-transform: uppercase;">Supplied Items (${items.length})</h4>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>SKU</th>
                        <th>Current Stock</th>
                        <th>Reorder Point</th>
                        <th>Last Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => {
                        const status = getItemStatus(item);
                        return `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.sku}</td>
                                <td><span class="stock-text ${status.level}">${item.current_stock}</span></td>
                                <td>${item.reorder_point}</td>
                                <td>${formatCurrency(item.last_purchase_price)}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>

        <h4 style="margin: 24px 0 12px; color: var(--text-secondary); font-size: 13px; text-transform: uppercase;">Purchase History (${pos.length} orders)</h4>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>PO Number</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${pos.map(po => {
                        const status = getPOStatusBadge(po.status);
                        return `
                            <tr>
                                <td>${po.po_number}</td>
                                <td><span class="badge ${status.class}">${status.label}</span></td>
                                <td>${formatCurrency(po.total_amount)}</td>
                                <td>${formatDate(po.created_at)}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;

    openModal('item-detail-modal');
}

// ============================================
// REPORTS RENDERER
// ============================================

function renderReports(container) {
    let html = `
        <div class="page-header">
            <h1><i class="fas fa-chart-bar"></i> Reports</h1>
            <div class="page-header-actions">
                <button class="btn btn-outline" onclick="showToast('Export', 'Report exported to PDF', 'success')">
                    <i class="fas fa-download"></i> Export All
                </button>
            </div>
        </div>

        <div class="tabs">
            <div class="tab active" data-report="low-stock" onclick="switchReportTab('low-stock')">Low Stock</div>
            <div class="tab" data-report="po-summary" onclick="switchReportTab('po-summary')">PO Summary</div>
            <div class="tab" data-report="stock-movement" onclick="switchReportTab('stock-movement')">Stock Movement</div>
            <div class="tab" data-report="discrepancies" onclick="switchReportTab('discrepancies')">Discrepancies</div>
        </div>

        <div id="report-content">
            <!-- Populated by JS -->
        </div>
    `;

    container.innerHTML = html;
    renderReport('low-stock');
}

function switchReportTab(report) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.tab[data-report="${report}"]`)?.classList.add('active');
    renderReport(report);
}

function renderReport(reportType) {
    const content = document.getElementById('report-content');
    if (!content) return;

    switch(reportType) {
        case 'low-stock':
            content.innerHTML = renderLowStockReport();
            break;
        case 'po-summary':
            content.innerHTML = renderPOSummaryReport();
            break;
        case 'stock-movement':
            content.innerHTML = renderStockMovementReport();
            break;
        case 'discrepancies':
            content.innerHTML = renderDiscrepanciesReport();
            break;
    }
}

function renderLowStockReport() {
    const lowStockItems = DEMO_ITEMS.filter(item => item.current_stock <= item.reorder_point);
    const totalCost = lowStockItems.reduce((sum, item) => sum + (item.reorder_qty * item.avg_purchase_price), 0);

    return `
        <div class="card">
            <div class="card-header">
                <h2><i class="fas fa-exclamation-triangle"></i> Low Stock Report</h2>
                <div>
                    <span style="font-weight: 600; color: var(--danger);">${lowStockItems.length} items</span> below reorder point
                </div>
            </div>
            <div class="card-body">
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle alert-icon"></i>
                    <div class="alert-content">
                        <div class="alert-title">Estimated Cost to Replenish: ${formatCurrency(totalCost)}</div>
                        <div class="alert-text">Create purchase orders for these items to maintain optimal stock levels.</div>
                    </div>
                </div>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Current Stock</th>
                                <th>Reorder Point</th>
                                <th>Shortage</th>
                                <th>Suggested Order</th>
                                <th>Est. Cost</th>
                                <th>Supplier</th>
                                <th>Last Purchase</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${lowStockItems.map(item => {
                                const shortage = Math.max(0, item.reorder_point - item.current_stock);
                                const estCost = item.reorder_qty * item.avg_purchase_price;
                                return `
                                    <tr>
                                        <td>
                                            <strong>${item.name}</strong>
                                            <div style="font-size: 12px; color: var(--text-muted)">${item.sku}</div>
                                        </td>
                                        <td style="color: var(--danger); font-weight: 600;">${item.current_stock}</td>
                                        <td>${item.reorder_point}</td>
                                        <td style="color: var(--danger);">${shortage}</td>
                                        <td>${item.reorder_qty} ${getUnitAbbreviation(item.unit_id)}</td>
                                        <td>${formatCurrency(estCost)}</td>
                                        <td>${getSupplierName(item.supplier_id)}</td>
                                        <td>${item.last_purchase_price ? formatCurrency(item.last_purchase_price) : '-'}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function renderPOSummaryReport() {
    const pos = DEMO_PURCHASE_ORDERS;
    const totalSpent = pos.filter(po => po.status === 'received').reduce((sum, po) => sum + po.total_amount, 0);
    const pendingValue = pos.filter(po => po.status === 'pending').reduce((sum, po) => sum + po.total_amount, 0);

    const statusCounts = {};
    pos.forEach(po => {
        statusCounts[po.status] = (statusCounts[po.status] || 0) + 1;
    });

    return `
        <div class="stats-grid" style="margin-bottom: 24px;">
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-card-title">Total POs</div>
                    <div class="stat-card-icon blue"><i class="fas fa-file-invoice"></i></div>
                </div>
                <div class="stat-card-value">${pos.length}</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-card-title">Total Spent</div>
                    <div class="stat-card-icon green"><i class="fas fa-money-bill-wave"></i></div>
                </div>
                <div class="stat-card-value" style="color: var(--success)">${formatCurrency(totalSpent)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-card-title">Pending Value</div>
                    <div class="stat-card-icon orange"><i class="fas fa-clock"></i></div>
                </div>
                <div class="stat-card-value" style="color: var(--warning)">${formatCurrency(pendingValue)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-card-title">Received</div>
                    <div class="stat-card-icon blue"><i class="fas fa-check-circle"></i></div>
                </div>
                <div class="stat-card-value">${statusCounts['received'] || 0}</div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h2><i class="fas fa-list-alt"></i> Purchase Order Summary</h2>
            </div>
            <div class="card-body">
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>PO Number</th>
                                <th>Requester</th>
                                <th>Supplier</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Received</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(po => {
                                const poItems = DEMO_PO_ITEMS.filter(pi => pi.po_id === po.id);
                                const status = getPOStatusBadge(po.status);
                                return `
                                    <tr>
                                        <td><strong>${po.po_number}</strong></td>
                                        <td>${getUserName(po.requester_id)}</td>
                                        <td>${getSupplierName(po.supplier_id)}</td>
                                        <td>${poItems.length}</td>
                                        <td>${formatCurrency(po.total_amount)}</td>
                                        <td><span class="badge ${status.class}">${status.label}</span></td>
                                        <td>${formatDate(po.created_at)}</td>
                                        <td>${po.received_at ? formatDate(po.received_at) : '-'}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function renderStockMovementReport() {
    const logs = DEMO_STOCK_LOGS.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return `
        <div class="card">
            <div class="card-header">
                <h2><i class="fas fa-exchange-alt"></i> Stock Movement Report</h2>
            </div>
            <div class="card-body">
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Item</th>
                                <th>Type</th>
                                <th>Quantity</th>
                                <th>Old Stock</th>
                                <th>New Stock</th>
                                <th>Reason</th>
                                <th>By</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${logs.map(log => {
                                const item = DEMO_ITEMS.find(i => i.id === log.item_id);
                                return `
                                    <tr>
                                        <td>${formatDateTime(log.created_at)}</td>
                                        <td>${item ? item.name : 'Unknown'}</td>
                                        <td>
                                            <span class="badge ${log.type === 'purchase' ? 'badge-success' : log.type === 'sale' ? 'badge-danger' : log.type === 'daily_count' ? 'badge-warning' : 'badge-secondary'}">
                                                ${log.type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td style="color: ${log.quantity > 0 ? 'var(--success)' : log.quantity < 0 ? 'var(--danger)' : 'var(--text-secondary)'}; font-weight: 600;">
                                            ${log.quantity > 0 ? '+' : ''}${log.quantity}
                                        </td>
                                        <td>${log.old_stock}</td>
                                        <td>${log.new_stock}</td>
                                        <td>${log.reason || '-'}</td>
                                        <td>${getUserName(log.user_id)}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function renderDiscrepanciesReport() {
    const discrepancies = DEMO_DAILY_COUNTS.filter(d => d.discrepancy !== 0).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return `
        <div class="card">
            <div class="card-header">
                <h2><i class="fas fa-not-equal"></i> Stock Discrepancies Report</h2>
            </div>
            <div class="card-body">
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Item</th>
                                <th>Expected</th>
                                <th>Actual</th>
                                <th>Difference</th>
                                <th>Status</th>
                                <th>Notes</th>
                                <th>By</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${discrepancies.map(d => {
                                const item = DEMO_ITEMS.find(i => i.id === d.item_id);
                                return `
                                    <tr>
                                        <td>${d.count_date}</td>
                                        <td>${item ? item.name : 'Unknown'}</td>
                                        <td>${d.expected_stock}</td>
                                        <td>${d.actual_count}</td>
                                        <td style="color: ${d.discrepancy < 0 ? 'var(--danger)' : 'var(--success)'}; font-weight: 600;">
                                            ${d.discrepancy > 0 ? '+' : ''}${d.discrepancy}
                                        </td>
                                        <td>
                                            <span class="badge ${d.is_resolved ? 'badge-success' : 'badge-warning'}">
                                                ${d.is_resolved ? 'Resolved' : 'Pending'}
                                            </span>
                                        </td>
                                        <td>${d.notes || '-'}</td>
                                        <td>${getUserName(d.user_id)}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// SETTINGS RENDERER
// ============================================

function renderSettings(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1><i class="fas fa-cog"></i> Settings</h1>
        </div>

        <div class="card" style="margin-bottom: 24px;">
            <div class="card-header">
                <h2><i class="fas fa-user"></i> My Profile</h2>
            </div>
            <div class="card-body">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" class="form-control" value="${currentUser.name}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" class="form-control" value="${currentUser.email}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Role</label>
                        <input type="text" class="form-control" value="${currentUser.roleLabel}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Phone</label>
                        <input type="text" class="form-control" value="09123456789" readonly>
                    </div>
                </div>
            </div>
        </div>

        <div class="card" style="margin-bottom: 24px;">
            <div class="card-header">
                <h2><i class="fas fa-bell"></i> Notification Settings</h2>
            </div>
            <div class="card-body">
                <div style="display: flex; flex-direction: column; gap: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 500;">Email Notifications</div>
                            <div style="font-size: 13px; color: var(--text-muted)">Receive email alerts for important events</div>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 500;">Low Stock Alerts</div>
                            <div style="font-size: 13px; color: var(--text-muted)">Get notified when items are below reorder point</div>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 500;">PO Status Updates</div>
                            <div style="font-size: 13px; color: var(--text-muted)">Notifications for purchase order changes</div>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h2><i class="fas fa-shield-alt"></i> Security</h2>
            </div>
            <div class="card-body">
                <button class="btn btn-outline" onclick="showToast('Coming Soon', 'Password change will be available soon', 'info')">
                    <i class="fas fa-key"></i> Change Password
                </button>
            </div>
        </div>
    `;
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Set default delivery date to 3 days from now
    const date = new Date();
    date.setDate(date.getDate() + 3);
    document.getElementById('po-delivery-date').value = date.toISOString().split('T')[0];

    // Initialize notification badge
    updateNotificationBadge();
});

// Add toggle switch CSS dynamically
const toggleCSS = `
    .toggle-switch {
        position: relative;
        display: inline-block;
        width: 48px;
        height: 24px;
    }
    .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }
    .toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--border-color);
        transition: .3s;
        border-radius: 24px;
    }
    .toggle-slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .3s;
        border-radius: 50%;
    }
    input:checked + .toggle-slider {
        background-color: var(--primary);
    }
    input:checked + .toggle-slider:before {
        transform: translateX(24px);
    }
`;

const style = document.createElement('style');
style.textContent = toggleCSS;
document.head.appendChild(style);
