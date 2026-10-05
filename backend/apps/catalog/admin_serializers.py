from rest_framework import serializers

from .models import (
    Category,
    Color,
    Product,
    ProductColor,
    ProductImage,
    ProductVariant,
    Size,
    SizeType,
)

from .services import (
    create_product,
    create_product_variant,
    generate_color_slug,
)


class AdminCategorySerializer(serializers.ModelSerializer):
    default_size_type = serializers.PrimaryKeyRelatedField(
        queryset=SizeType.objects.filter(is_active=True),
    )

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "code",
            "default_size_type",
            "next_product_sequence",
            "is_active",
        ]

        read_only_fields = [
            "id",
            "next_product_sequence",
        ]


class AdminProductSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.filter(is_active=True),
    )

    size_type = serializers.PrimaryKeyRelatedField(
        queryset=SizeType.objects.filter(is_active=True),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Product
        fields = [
            "id",
            "product_code",
            "slug",
            "name",
            "description",
            "material",
            "badge",
            "category",
            "gender",
            "size_type",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "product_code",
            "slug",
            "created_at",
            "updated_at",
        ]

    def create(self, validated_data):
        return create_product(
            **validated_data,
        )


class AdminProductColorSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True),
    )

    color = serializers.PrimaryKeyRelatedField(
        queryset=Color.objects.filter(is_active=True),
    )

    class Meta:
        model = ProductColor
        fields = [
            "id",
            "product",
            "color",
            "is_active",
        ]

        read_only_fields = [
            "id",
        ]


class AdminProductVariantSerializer(serializers.ModelSerializer):
    product_color = serializers.PrimaryKeyRelatedField(
        queryset=ProductColor.objects.select_related(
            "product",
            "color",
        ),
    )

    size = serializers.PrimaryKeyRelatedField(
        queryset=Size.objects.filter(is_active=True),
    )

    class Meta:
        model = ProductVariant
        fields = [
            "id",
            "sku",
            "product_color",
            "size",
            "price",
            "is_active",
        ]

        read_only_fields = [
            "id",
            "sku",
        ]

    def validate(self, attrs):
        product_color = attrs.get(
            "product_color",
            getattr(self.instance, "product_color", None),
        )

        size = attrs.get(
            "size",
            getattr(self.instance, "size", None),
        )

        # Product color dan size wajib tersedia.
        if not product_color:
            raise serializers.ValidationError({"product_color": "Product color is required."})

        if not size:
            raise serializers.ValidationError({"size": "Size is required."})

        # Cek duplicate combination.
        queryset = ProductVariant.objects.filter(
            product_color=product_color,
            size=size,
        )

        # Saat update, jangan anggap instance sendiri sebagai duplicate.
        if self.instance:
            queryset = queryset.exclude(
                pk=self.instance.pk,
            )

        if queryset.exists():
            raise serializers.ValidationError(
                {
                    "non_field_errors": [
                        "A product variant with this " "product color and size already exists."
                    ]
                }
            )

        # Size harus sesuai dengan size type product.
        product = product_color.product

        if size.size_type_id != product.size_type_id:
            raise serializers.ValidationError(
                {"size": (f"Size '{size.name}' does not belong " f"to the product size type.")}
            )

        return attrs

    def create(self, validated_data):
        return create_product_variant(
            **validated_data,
        )


class AdminProductImageSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True),
    )

    product_color = serializers.PrimaryKeyRelatedField(
        queryset=ProductColor.objects.select_related(
            "product",
            "color",
        ),
    )

    class Meta:
        model = ProductImage
        fields = [
            "id",
            "product",
            "product_color",
            "image",
            "image_type",
            "sort_order",
        ]

        read_only_fields = [
            "id",
        ]

    def validate(self, attrs):
        product = attrs.get(
            "product",
            getattr(self.instance, "product", None),
        )

        product_color = attrs.get(
            "product_color",
            getattr(self.instance, "product_color", None),
        )

        image_type = attrs.get(
            "image_type",
            getattr(self.instance, "image_type", None),
        )

        if not product:
            raise serializers.ValidationError({"product": "Product is required."})

        if not product_color:
            raise serializers.ValidationError({"product_color": "Product color is required."})

        # ProductColor harus berasal dari Product yang sama.
        if product_color.product_id != product.id:
            raise serializers.ValidationError(
                {"product_color": ("Product color must belong to the selected product.")}
            )

        # Hanya boleh ada satu primary image untuk setiap product.
        if image_type == ProductImage.ImageType.PRIMARY:
            queryset = ProductImage.objects.filter(
                product_id=product.id,
                image_type=ProductImage.ImageType.PRIMARY,
            )

            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)

            if queryset.exists():
                raise serializers.ValidationError(
                    {"image_type": ("A product can only have one primary image.")}
                )

        return attrs


class AdminColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Color
        fields = [
            "id",
            "name",
            "code",
            "slug",
            "hex_code",
            "is_active",
        ]

        read_only_fields = [
            "id",
            "slug",
        ]

    def create(self, validated_data):
        validated_data["slug"] = generate_color_slug(validated_data["name"])

        return Color.objects.create(
            **validated_data,
        )


class AdminSizeSerializer(serializers.ModelSerializer):
    size_type = serializers.PrimaryKeyRelatedField(
        queryset=SizeType.objects.filter(is_active=True),
    )

    class Meta:
        model = Size
        fields = [
            "id",
            "name",
            "size_type",
            "sort_order",
            "is_active",
        ]

        read_only_fields = [
            "id",
        ]


class AdminSizeTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SizeType
        fields = [
            "id",
            "name",
            "code",
            "is_active",
        ]

        read_only_fields = [
            "id",
            "code",
        ]
