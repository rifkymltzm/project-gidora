from rest_framework import serializers

from .models import Address


class AddressSerializer(serializers.ModelSerializer):
    label = serializers.CharField(
        max_length=50,
        help_text="Label alamat, misalnya Home, Office, atau Apartment.",
    )

    recipient_name = serializers.CharField(
        max_length=150,
        help_text="Nama penerima barang.",
    )

    phone_number = serializers.CharField(
        max_length=30,
        help_text="Nomor telepon penerima.",
    )

    address_line = serializers.CharField(
        help_text="Alamat lengkap, termasuk nama jalan dan nomor rumah.",
    )

    sub_district = serializers.CharField(
        max_length=100,
        help_text="Kelurahan/desa.",
    )

    district = serializers.CharField(
        max_length=100,
        help_text="Kecamatan.",
    )

    city = serializers.CharField(
        max_length=100,
        help_text="Kota/kabupaten.",
    )

    province = serializers.CharField(
        max_length=100,
        help_text="Provinsi.",
    )

    postal_code = serializers.CharField(
        max_length=20,
        help_text="Kode pos.",
    )

    country = serializers.CharField(
        max_length=100,
        help_text="Negara. Default: Indonesia.",
    )

    class Meta:
        model = Address
        fields = [
            "id",
            "label",
            "recipient_name",
            "phone_number",
            "address_line",
            "sub_district",
            "district",
            "city",
            "province",
            "postal_code",
            "country",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]
