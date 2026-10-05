import base64
import hashlib
import hmac
from decimal import Decimal

import requests

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured


class MidtransAPIError(Exception):
    """Raised when Midtrans API returns an error response."""


class MidtransClient:
    PAYMENT_METHOD_MAP = {
        "BCA_VA": {
            "payment_type": "bank_transfer",
            "bank": "bca",
        },
        "BNI_VA": {
            "payment_type": "bank_transfer",
            "bank": "bni",
        },
        "BRI_VA": {
            "payment_type": "bank_transfer",
            "bank": "bri",
        },
        "PERMATA_VA": {
            "payment_type": "bank_transfer",
            "bank": "permata",
        },
        "CIMB_VA": {
            "payment_type": "bank_transfer",
            "bank": "cimb",
        },
        "MANDIRI": {
            "payment_type": "echannel",
        },
        "GOPAY": {
            "payment_type": "gopay",
        },
        "SHOPEEPAY": {
            "payment_type": "shopeepay",
        },
        "QRIS": {
            "payment_type": "qris",
        },
    }

    def __init__(self):
        self.environment = settings.MIDTRANS_ENVIRONMENT
        self.server_key = settings.MIDTRANS_SERVER_KEY

        if not self.server_key:
            raise ImproperlyConfigured("MIDTRANS_SERVER_KEY is not configured.")

        self.base_url = self._get_base_url()

    def _get_base_url(self):
        if self.environment == "sandbox":
            return "https://api.sandbox.midtrans.com"

        if self.environment == "production":
            return "https://api.midtrans.com"

        raise ImproperlyConfigured("MIDTRANS_ENVIRONMENT must be 'sandbox' or 'production'.")

    def _get_auth_header(self):
        credentials = f"{self.server_key}:".encode("utf-8")
        encoded = base64.b64encode(credentials).decode("utf-8")

        return f"Basic {encoded}"

    def _build_charge_payload(
        self,
        *,
        order_id,
        amount,
        payment_method,
        customer_details=None,
        item_details=None,
        custom_field1=None,
        custom_field2=None,
        custom_field3=None,
        metadata=None,
    ):
        try:
            method = self.PAYMENT_METHOD_MAP[payment_method]
        except KeyError as exc:
            raise ValueError(f"Unsupported payment method: {payment_method}") from exc

        payload = {
            "payment_type": method["payment_type"],
            "transaction_details": {
                "order_id": order_id,
                "gross_amount": int(Decimal(amount)),
            },
        }

        if customer_details:
            payload["customer_details"] = customer_details

        if item_details:
            payload["item_details"] = item_details

        if custom_field1 is not None:
            payload["custom_field1"] = str(custom_field1)[:255]

        if custom_field2 is not None:
            payload["custom_field2"] = str(custom_field2)[:255]

        if custom_field3 is not None:
            payload["custom_field3"] = str(custom_field3)[:255]

        if metadata:
            payload["metadata"] = metadata

        if payment_method in {
            "BCA_VA",
            "BNI_VA",
            "BRI_VA",
            "PERMATA_VA",
            "CIMB_VA",
        }:
            payload["bank_transfer"] = {
                "bank": method["bank"],
            }

        elif payment_method == "MANDIRI":
            payload["echannel"] = {
                "bill_info1": "Payment",
                "bill_info2": "GIDORA Order",
            }

        elif payment_method == "GOPAY":
            payload["gopay"] = {
                "enable_callback": True,
                "callback_url": settings.MIDTRANS_GOPAY_CALLBACK_URL,
            }

        elif payment_method == "SHOPEEPAY":
            payload["shopeepay"] = {
                "callback_url": settings.MIDTRANS_SHOPEEPAY_CALLBACK_URL,
            }

        elif payment_method == "QRIS":
            payload["qris"] = {
                "acquirer": "gopay",
            }

        return payload

    def create_transaction(
        self,
        *,
        order_id,
        amount,
        payment_method,
        customer_details=None,
        item_details=None,
        custom_field1=None,
        custom_field2=None,
        custom_field3=None,
        metadata=None,
    ):
        payload = self._build_charge_payload(
            order_id=order_id,
            amount=amount,
            payment_method=payment_method,
            customer_details=customer_details,
            item_details=item_details,
            custom_field1=custom_field1,
            custom_field2=custom_field2,
            custom_field3=custom_field3,
            metadata=metadata,
        )

        response = requests.post(
            f"{self.base_url}/v2/charge",
            headers={
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": self._get_auth_header(),
            },
            json=payload,
            timeout=30,
        )

        return self._handle_response(response)

    def get_transaction_status(self, identifier):
        """
        Get transaction status from Midtrans.

        identifier can be:
        - GIDORA order_number
        - Midtrans transaction_id
        """

        if not identifier:
            raise ValueError("Transaction identifier is required.")

        response = requests.get(
            f"{self.base_url}/v2/{identifier}/status",
            headers={
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": self._get_auth_header(),
            },
            timeout=30,
        )

        return self._handle_response(response)

    def verify_notification_signature(self, payload):
        order_id = payload.get("order_id")
        status_code = payload.get("status_code")
        gross_amount = payload.get("gross_amount")
        signature_key = payload.get("signature_key")

        if not all(
            [
                order_id,
                status_code,
                gross_amount,
                signature_key,
            ]
        ):
            return False

        raw_signature = f"{order_id}" f"{status_code}" f"{gross_amount}" f"{self.server_key}"

        expected_signature = hashlib.sha512(raw_signature.encode("utf-8")).hexdigest()

        return hmac.compare_digest(
            expected_signature,
            signature_key,
        )

    @staticmethod
    def _handle_response(response):
        try:
            data = response.json()
        except ValueError:
            data = {
                "status_code": str(response.status_code),
                "status_message": response.text,
            }

        if not response.ok:
            raise MidtransAPIError(f"Midtrans API error " f"{response.status_code}: {data}")

        return data
