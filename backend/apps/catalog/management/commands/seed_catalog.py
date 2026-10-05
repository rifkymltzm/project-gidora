from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from apps.catalog.models import (
    Category,
    Color,
    Size,
    SizeType,
)


class Command(BaseCommand):
    help = "Seed GIDORA catalog master data."

    @transaction.atomic
    def handle(self, *args, **options):
        self.seed_size_types()
        self.seed_sizes()
        self.seed_categories()
        self.seed_colors()

        self.stdout.write(self.style.SUCCESS("GIDORA catalog master data seeded successfully."))

    def seed_size_types(self):
        size_types = [
            ("APPAREL", "Apparel"),
            ("FOOTWEAR", "Footwear"),
            ("ONE_SIZE", "One Size"),
        ]

        for code, name in size_types:
            SizeType.objects.update_or_create(
                code=code,
                defaults={
                    "name": name,
                    "is_active": True,
                },
            )

    def seed_sizes(self):
        size_data = {
            "APPAREL": [
                ("XS", 1),
                ("S", 2),
                ("M", 3),
                ("L", 4),
                ("XL", 5),
                ("XXL", 6),
            ],
            "FOOTWEAR": [
                ("39", 1),
                ("40", 2),
                ("41", 3),
                ("42", 4),
                ("43", 5),
                ("44", 6),
                ("45", 7),
            ],
            "ONE_SIZE": [
                ("one-size", 1),
            ],
        }

        for size_type_code, sizes in size_data.items():
            size_type = SizeType.objects.get(code=size_type_code)

            for name, sort_order in sizes:
                Size.objects.update_or_create(
                    size_type=size_type,
                    name=name,
                    defaults={
                        "sort_order": sort_order,
                        "is_active": True,
                    },
                )

    def seed_categories(self):
        categories = [
            ("Outerwear", "OW", "APPAREL"),
            ("Pants", "PT", "APPAREL"),
            ("Shirts", "SH", "APPAREL"),
            ("Accessories", "AC", "ONE_SIZE"),
            ("Footwear", "FW", "FOOTWEAR"),
        ]

        for name, code, size_type_code in categories:
            size_type = SizeType.objects.get(code=size_type_code)

            Category.objects.update_or_create(
                code=code,
                defaults={
                    "name": name,
                    "default_size_type": size_type,
                    "is_active": True,
                },
            )

    def seed_colors(self):
        colors = [
            ("Black", "BLK", "#000000"),
            ("White", "WHT", "#FFFFFF"),
            ("Gray", "GRY", "#808080"),
            ("Navy", "NVY", "#000080"),
            ("Olive", "OLV", "#808000"),
            ("Beige", "BGE", "#F5F5DC"),
            ("Pink", "PNK", "#FFC0CB"),
        ]

        for name, code, hex_code in colors:
            Color.objects.update_or_create(
                code=code,
                defaults={
                    "name": name,
                    "slug": slugify(name),
                    "hex_code": hex_code,
                    "is_active": True,
                },
            )
