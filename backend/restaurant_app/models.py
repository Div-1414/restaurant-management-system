from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

class User(AbstractUser):
    ROLE_CHOICES = [
        ('super_admin', 'Super Admin'),
        ('owner', 'Restaurant Owner'),
        ('restaurant_manager', 'Restaurant Manager'),
        ('kitchen_staff', 'Kitchen Staff'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='owner')
    restaurant = models.ForeignKey('Restaurant', on_delete=models.CASCADE, null=True, blank=True, related_name='staff')
    phone = models.CharField(max_length=20, blank=True)

    class Meta:
        db_table = 'users'

import uuid
from django.db import models
from django.conf import settings

class Restaurant(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]

    # ===== Not optional fields =====
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    location = models.TextField()
    contact = models.CharField(max_length=20)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    is_open = models.BooleanField(default=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='owned_restaurants'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # ===== NEW OPTIONAL INFO FIELDS (SAFE) =====
    description = models.TextField(blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=10, blank=True)
    support_email = models.EmailField(blank=True)
    support_phone = models.CharField(max_length=20, blank=True)
    logo = models.ImageField(upload_to='restaurant_logos/', blank=True, null=True)


    class Meta:
        db_table = 'restaurants'

    def __str__(self):
        return self.name


class Table(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('occupied', 'Occupied'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # 🔴 KEEP restaurant (DO NOT REMOVE – backward compatibility)
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name='tables'
    )

    # ✅ NEW hall relation (nullable for old data)
    hall = models.ForeignKey(
        'Hall',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='tables'
    )

    table_number = models.IntegerField()
    qr_code = models.TextField(blank=True)

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='available'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'tables'
        ordering = ['table_number']

        # ✅ NEW uniqueness rule (per hall)
        unique_together = ['hall', 'table_number']

    def __str__(self):
        hall_name = self.hall.name if self.hall else 'General'
        return f"Table {self.table_number} - {hall_name}"


class MenuCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='menu_categories')
    name = models.CharField(max_length=255)
    image = models.URLField(blank=True)
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'menu_categories'
        ordering = ['display_order', 'name']

    def __str__(self):
        return f"{self.name} - {self.restaurant.name}"

class MenuItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(MenuCategory, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    # existing field (we won't use it in UI)
    image = models.URLField(blank=True)

    # existing
    available = models.BooleanField(default=True)

    # ✅ NEW FIELD
    allow_half = models.BooleanField(default=False)
    # ✅ Half plate price (ONLY if allow_half = True)
    half_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'menu_items'

    def __str__(self):
        return self.name


class OrderSession(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('bill_generated', 'Bill Generated'),
        ('paid', 'Paid'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    table = models.ForeignKey(
    Table,
    on_delete=models.CASCADE,
    related_name='sessions',
    null=True,
    blank=True)
    table_group = models.ForeignKey(
    'TableGroup',
    on_delete=models.CASCADE,
    null=True,
    blank=True,
    related_name='sessions')
    customer_name = models.CharField(max_length=255, blank=True)
    customer_phone = models.CharField(max_length=20, blank=True)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
    max_length=20,
    choices=STATUS_CHOICES,
    default='active')


    class Meta:
        db_table = 'order_sessions'

    def __str__(self):
        return f"Session {self.id} - {self.table}"

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready'),
        ('completed', 'Completed'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(OrderSession, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    special_instructions = models.TextField(blank=True)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
    settings.AUTH_USER_MODEL,
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name='created_orders')
    ORDER_SOURCE_CHOICES = [
    ('qr', 'QR'),
    ('manager', 'Manager'),]
    order_source = models.CharField(
    max_length=10,
    choices=ORDER_SOURCE_CHOICES,
    default='qr')


    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']

    def __str__(self):
        return f"Order {self.id}"

class OrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)

    quantity = models.IntegerField(default=1)

    # 🔥 NEW FIELDS
    is_half = models.BooleanField(default=False)
    selected_options = models.ManyToManyField(
    'MenuItemOption',
    blank=True
)


    price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'order_items'

    def __str__(self):
        return f"{self.quantity}x {self.menu_item.name}"


class Bill(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.OneToOneField(OrderSession, on_delete=models.CASCADE, related_name='bill')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(max_length=10, choices=PAYMENT_STATUS_CHOICES, default='pending')
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    PAYMENT_MODE_CHOICES = [
    ('cash', 'Cash'),
    ('upi', 'UPI'),
    ('card', 'Card'),]
    payment_mode = models.CharField(
    max_length=10,
    choices=PAYMENT_MODE_CHOICES,
    null=True,
    blank=True)
    generated_by = models.ForeignKey(
    settings.AUTH_USER_MODEL,
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name='generated_bills')



    class Meta:
        db_table = 'bills'

    def __str__(self):
        return f"Bill {self.id}"



#--------------Hall Model-------------#
class Hall(models.Model):
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name='halls'
    )
    name = models.CharField(max_length=100)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.restaurant.name}"


#---For menu items---------#
class MenuItemOption(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    item = models.ForeignKey(
        'MenuItem',
        on_delete=models.CASCADE,
        related_name='options'
    )

    name = models.CharField(max_length=100)
    extra_price = models.DecimalField(max_digits=6, decimal_places=2)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'menu_item_options'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} (+₹{self.extra_price})"
    

# ================= PARCEL ORDER MODELS ================= #

class ParcelOrder(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),      # customer confirmed
        ('accepted', 'Accepted'),    # owner accepted → send to kitchen
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name='parcel_orders'
    )

    customer_name = models.CharField(max_length=100)
    customer_phone = models.CharField(max_length=20)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    total = models.DecimalField(
    max_digits=10,
    decimal_places=2,
    default=0
)

    accepted_at = models.DateTimeField(null=True, blank=True)
    kitchen_completed = models.BooleanField(default=False)
    kitchen_completed_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'parcel_orders'
        ordering = ['-created_at']

    def __str__(self):
        return f"Parcel {self.id} - {self.customer_name}"


class ParcelOrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    parcel_order = models.ForeignKey(
        ParcelOrder,
        on_delete=models.CASCADE,
        related_name='items'
    )

    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)

    quantity = models.IntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    selected_options = models.ManyToManyField(
        'MenuItemOption',
        blank=True
    )

    class Meta:
        db_table = 'parcel_order_items'

    def __str__(self):
        return f"{self.quantity}x {self.menu_item.name}"
    
class ParcelBill(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
    ]
    PAYMENT_MODE_CHOICES = [          
        ('cash', 'Cash'),
        ('upi', 'UPI'),
        ('card', 'Card'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    parcel_order = models.OneToOneField(
        ParcelOrder,
        on_delete=models.CASCADE,
        related_name='bill'
    )

    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    payment_status = models.CharField(
        max_length=10,
        choices=PAYMENT_STATUS_CHOICES,
        default='pending'
    )
    payment_mode = models.CharField(     
        max_length=10,
        choices=PAYMENT_MODE_CHOICES,
        null=True,
        blank=True
    )

    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'parcel_bills'

    def __str__(self):
        return f"ParcelBill {self.id}"

#----------Model for qr and bill preview------------#
class RestaurantPrintSettings(models.Model):
    restaurant = models.OneToOneField(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="print_settings"
    )

    # QR specific
    show_logo_on_qr = models.BooleanField(default=True)
    qr_custom_text = models.CharField(max_length=120, blank=True)

    # Bill specific
    show_logo_on_bill = models.BooleanField(default=True)
    show_address_on_bill = models.BooleanField(default=True)
    show_phone_on_bill = models.BooleanField(default=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "restaurant_print_settings"

#-----For Table Grouping--------------------------#
class TableGroup(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name='table_groups'
    )

    tables = models.ManyToManyField(
        Table,
        related_name='table_groups'
    )

    is_active = models.BooleanField(default=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'table_groups'

    def __str__(self):
        return f"Group {self.id}"
