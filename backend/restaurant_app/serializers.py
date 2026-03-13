from rest_framework import serializers
from .models import User, Restaurant, Table, MenuCategory, MenuItem, OrderSession, Order, OrderItem, Bill,MenuItemOption

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'restaurant', 'phone', 'first_name', 'last_name','is_active',]
        read_only_fields = ['id']

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'restaurant', 'phone', 'first_name', 'last_name']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


from .models import Restaurant


class RestaurantSerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()
    owner_username = serializers.CharField(
        source='owner.username',
        read_only=True
    )
    owner_email = serializers.EmailField(
        source='owner.email',
        read_only=True
    )
    owner_phone = serializers.CharField(
        source='owner.phone',
        read_only=True
    )

    tables_count = serializers.SerializerMethodField()

    # ✅ keep status writable (DO NOT REMOVE)
    status = serializers.CharField()

    # ✅ logo as ImageField (VERY IMPORTANT)
    logo = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Restaurant
        fields = [
            # Core
            'id',
            'name',
            'location',
            'contact',
            'status',
            'is_open',

            # Optional details
            'description',
            'address',
            'city',
            'state',
            'pincode',
            'logo',
            'support_email',
            'support_phone',

            # Owner
            'owner',
            'owner_username',   # login username (READ ONLY)
            'owner_name',       # full name (computed)
            'owner_email',
            'owner_phone',

            # System
            'tables_count',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'owner',
            'owner_username',
            'owner_name',
            'owner_email',
            'owner_phone',
            'tables_count',
            'created_at',
            'updated_at',
        ]

    # ---------------- HELPERS ----------------

    def get_tables_count(self, obj):
        return obj.tables.count()

    def get_owner_name(self, obj):
        """
        Returns owner's full name if available,
        otherwise fallback to username.
        BACKWARD SAFE.
        """
        if not obj.owner:
            return None

        full_name = f"{obj.owner.first_name or ''} {obj.owner.last_name or ''}".strip()
        return full_name if full_name else obj.owner.username

    def to_representation(self, instance):
        """
        Ensure logo is returned as FULL URL for frontend
        """
        data = super().to_representation(instance)
        request = self.context.get('request')

        if instance.logo:
            if request:
                data['logo'] = request.build_absolute_uri(instance.logo.url)
            else:
                data['logo'] = instance.logo.url
        else:
            data['logo'] = None

        return data



from .models import Table


class TableSerializer(serializers.ModelSerializer):
    hall_name = serializers.CharField(source='hall.name', read_only=True)

    class Meta:
        model = Table
        fields = [
            'id',
            'restaurant',
            'hall',        # ✅ hall id (writable)
            'hall_name',   # ✅ hall name (read only)
            'table_number',
            'status',
            'qr_code',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'qr_code',
            'created_at',
        ]


class MenuCategorySerializer(serializers.ModelSerializer):
    items_count = serializers.SerializerMethodField()
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)

    class Meta:
        model = MenuCategory
        fields = ['id', 'restaurant', 'restaurant_name', 'name', 'image', 'display_order', 'items_count', 'created_at']  
        read_only_fields = ['id', 'restaurant_name', 'created_at']

    def get_items_count(self, obj):
        return obj.items.count()

#---- For  Menu-------------------------------#

class MenuItemOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItemOption
        fields = [
            'id',
            'name',
            'extra_price',
            'is_active',
        ]

class MenuItemOptionWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItemOption
        fields = [
            'name',
            'extra_price',
            'is_active',
            'item',
        ]  


class MenuItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    options = MenuItemOptionSerializer(many=True, read_only=True)

    class Meta:
        model = MenuItem
        fields = [
            'id',
            'category',
            'category_name',
            'name',
            'description',
            'price',
            'half_price',        # ✅ ADD THIS
            'image',
            'available',
            'allow_half',
            'options',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def validate(self, attrs):
        allow_half = attrs.get('allow_half', False)
        half_price = attrs.get('half_price')

        if allow_half and half_price is None:
            raise serializers.ValidationError(
                {"half_price": "Half price is required when half plate is enabled."}
            )

        if not allow_half:
            attrs['half_price'] = None

        return attrs


#---------------------oderitems----------------------------#

class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(
        source='menu_item.name',
        read_only=True
    )

    menu_item_image = serializers.CharField(
        source='menu_item.image',
        read_only=True
    )

    allow_half = serializers.BooleanField(
        source='menu_item.allow_half',
        read_only=True
    )

    # ✅ ADD THIS: Include selected options (add-ons)
    selected_options = MenuItemOptionSerializer(many=True, read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'order',
            'menu_item',
            'menu_item_name',
            'menu_item_image',
            'quantity',
            'price',
            'allow_half',
            'selected_options',              'is_half',           
        ]
        read_only_fields = ['id']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    table_number = serializers.IntegerField(source='session.table.table_number', read_only=True)
    restaurant_id = serializers.UUIDField(source='session.table.restaurant.id', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'session', 'status', 'special_instructions', 'total', 'items', 'table_number', 'restaurant_id', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class OrderSessionSerializer(serializers.ModelSerializer):
    orders = OrderSerializer(many=True, read_only=True)
    table_number = serializers.IntegerField(source='table.table_number', read_only=True)

    class Meta:
        model = OrderSession
        fields = ['id', 'table', 'table_number', 'start_time', 'end_time', 'status', 'orders']
        read_only_fields = ['id', 'start_time']

class BillSerializer(serializers.ModelSerializer):
    table_number = serializers.IntegerField(source='session.table.table_number', read_only=True)
    orders = OrderSerializer(source='session.orders', many=True, read_only=True)
    customer_name = serializers.CharField(source='session.customer_name', read_only=True)
    customer_phone = serializers.CharField(source='session.customer_phone', read_only=True)

    class Meta:
        model = Bill
        fields = ['id', 'session', 'table_number', 'customer_name', 'customer_phone', 'subtotal', 'tax', 'total', 'payment_status', 'paid_at', 'orders', 'created_at']
        read_only_fields = ['id', 'created_at']



from restaurant_app.models import Hall


class HallSerializer(serializers.ModelSerializer):
    restaurant_name = serializers.CharField(
        source='restaurant.name',
        read_only=True
    )

    tables_count = serializers.SerializerMethodField()

    class Meta:
        model = Hall
        fields = [
            'id',
            'restaurant',
            'restaurant_name',
            'name',
            'tables_count',
            'created_at',
        ]

        read_only_fields = [
            'id',
            'restaurant_name',
            'tables_count',
            'created_at',
        ]

    def get_tables_count(self, obj):
        return obj.tables.count()



#-----------------Parcel Serializers------------------#
from rest_framework import serializers
from .models import ParcelOrder, ParcelOrderItem, ParcelBill


class ParcelOrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(
        source='menu_item.name',
        read_only=True
    )

    class Meta:
        model = ParcelOrderItem
        fields = [
            'id',
            'menu_item',
            'menu_item_name',
            'quantity',
            'price'
        ]


class ParcelOrderSerializer(serializers.ModelSerializer):
    items = ParcelOrderItemSerializer(many=True, read_only=True)
    has_bill = serializers.SerializerMethodField()
    bill = serializers.SerializerMethodField()
    timer_seconds = serializers.SerializerMethodField()

    class Meta:
        model = ParcelOrder
        fields = [
            'id',
            'restaurant',
            'customer_name',
            'customer_phone',
            'status',
            'total',
            'items',
            'created_at',
            'accepted_at',
            'kitchen_completed',
            'kitchen_completed_at',
            'has_bill',
            'bill',
            'timer_seconds',
        ]
        read_only_fields = ['restaurant', 'status', 'total']
        
    def get_has_bill(self, obj):
        try:
            _ = obj.bill
            return True
        except Exception:
            return False
        
    def get_bill(self, obj):
        try:
            return {
                'id': str(obj.bill.id),
                'payment_status': obj.bill.payment_status,
                'paid_at': obj.bill.paid_at.isoformat() if obj.bill.paid_at else None,
                'subtotal': str(obj.bill.subtotal),
                'tax': str(obj.bill.tax),
                'total': str(obj.bill.total),
            }
        except Exception:
            return None

    def get_timer_seconds(self, obj):
        if not obj.accepted_at:
            return None
        from django.utils import timezone
        end = obj.kitchen_completed_at if obj.kitchen_completed_at else timezone.now()
        return int((end - obj.accepted_at).total_seconds())  


from decimal import Decimal
from restaurant_app.models import MenuItem, MenuItemOption, ParcelOrder, ParcelOrderItem
from rest_framework import serializers


from restaurant_app.utils import calculate_menu_item_price


class ParcelOrderCreateSerializer(serializers.Serializer):
    customer_name = serializers.CharField()
    customer_phone = serializers.CharField()
    items = serializers.ListField()
    

    def create(self, validated_data):
      restaurant = self.context['restaurant']
      items_data = validated_data.pop('items')

      parcel_order = ParcelOrder.objects.create(
        restaurant=restaurant,
        customer_name=validated_data['customer_name'],
        customer_phone=validated_data['customer_phone'],
        status='pending'
     )

      total = Decimal('0.00')

      for item in items_data:
        menu_item = MenuItem.objects.get(id=item['menu_item'])

        quantity = item.get('quantity', 1)
        is_half = item.get('is_half', False)
        option_ids = item.get('options', [])

        final_price = calculate_menu_item_price(
            menu_item=menu_item,
            quantity=quantity,
            option_ids=option_ids
        )

        parcel_item = ParcelOrderItem.objects.create(  # ✅ save to variable
            parcel_order=parcel_order,
            menu_item=menu_item,
            quantity=quantity,
            price=final_price
        )

        # ✅ NOW save options — inside loop, after parcel_item is created
        if option_ids:
            options = MenuItemOption.objects.filter(id__in=option_ids, is_active=True)
            parcel_item.selected_options.set(options)

        total += final_price

      parcel_order.total = total
      parcel_order.save()

      return parcel_order


class ParcelBillItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(
        source='menu_item.name',
        read_only=True
    )

    class Meta:
        model = ParcelOrderItem
        fields = [
            'id',
            'menu_item_name',
            'quantity',
            'price',
        ]


class ParcelBillSerializer(serializers.ModelSerializer):
    parcel_order_id = serializers.UUIDField(
        source='parcel_order.id',
        read_only=True
    )

    customer_name = serializers.CharField(
        source='parcel_order.customer_name',
        read_only=True
    )
    customer_phone = serializers.CharField(
        source='parcel_order.customer_phone',
        read_only=True
    )

    items = ParcelOrderItemSerializer(
        source='parcel_order.items',
        many=True,
        read_only=True
    )

    class Meta:
        model = ParcelBill
        fields = [
            'id',
            'parcel_order_id',
            'customer_name',
            'customer_phone',
            'items',
            'subtotal',
            'tax',
            'total',
            'payment_status',
            'paid_at',
            'payment_mode',
            'created_at',
        ]

#-----For qr and bill preview--------#
from .models import RestaurantPrintSettings


class RestaurantPrintSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = RestaurantPrintSettings
        fields = [
            "show_logo_on_qr",
            "qr_custom_text",
            "show_logo_on_bill",
            "show_address_on_bill",
            "show_phone_on_bill",
        ]
