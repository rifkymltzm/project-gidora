import { useRef, useState, useEffect } from 'react';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import ComboBox from '@/components/ui/ComboBox';

const sanitizePostalCode = (value) => value.replace(/\D/g, '');

export default function ShippingAddress({ form, errors, setValue, handleBlur }) {
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);
  const [postalCodes, setPostalCodes] = useState([]);

  const [provinceId, setProvinceId] = useState('');
  const [cityId, setCityId] = useState('');
  const [districtId, setDistrictId] = useState('');

  const isSyncingFromPostal = useRef(false);

  // 1. Fetch Provinces
  useEffect(() => {
    fetch('https://www.emsifa.com/api-wilayah-indonesia/v2/provinces.json')
      .then((res) => res.json())
      .then((resJson) => {
        const data = resJson.data || resJson;
        setProvinces(data.map((item) => ({ value: item.name, label: item.name, id: item.id })));
      })
      .catch((err) => console.error('Failed to fetch provinces:', err));
  }, []);

  // Sync Province ID if form.province is pre-filled
  useEffect(() => {
    if (form.province && provinces.length > 0 && !provinceId) {
      const match = provinces.find((p) => p.value === form.province);
      if (match) setProvinceId(match.id);
    }
  }, [form.province, provinces, provinceId]);

  // 2. Fetch Cities
  useEffect(() => {
    if (!provinceId || isSyncingFromPostal.current) return;
    fetch(`https://www.emsifa.com/api-wilayah-indonesia/v2/regencies/${provinceId}.json`)
      .then((res) => res.json())
      .then((resJson) => {
        const data = resJson.data || resJson;
        setCities(data.map((item) => ({ value: item.name, label: item.name, id: item.id })));
      })
      .catch((err) => console.error('Failed to fetch cities:', err));
  }, [provinceId]);

  // Sync City ID if form.city is pre-filled
  useEffect(() => {
    if (form.city && cities.length > 0 && !cityId) {
      const match = cities.find((c) => c.value === form.city);
      if (match) setCityId(match.id);
    }
  }, [form.city, cities, cityId]);

  // 3. Fetch Districts
  useEffect(() => {
    if (!cityId || isSyncingFromPostal.current) return;
    fetch(`https://www.emsifa.com/api-wilayah-indonesia/v2/districts/${cityId}.json`)
      .then((res) => res.json())
      .then((resJson) => {
        const data = resJson.data || resJson;
        setDistricts(data.map((item) => ({ value: item.name, label: item.name, id: item.id })));
      })
      .catch((err) => console.error('Failed to fetch districts:', err));
  }, [cityId]);

  // Sync District ID if form.district is pre-filled
  useEffect(() => {
    if (form.district && districts.length > 0 && !districtId) {
      const match = districts.find((d) => d.value === form.district);
      if (match) setDistrictId(match.id);
    }
  }, [form.district, districts, districtId]);

  // 4. Fetch Villages
  useEffect(() => {
    if (!districtId || isSyncingFromPostal.current) return;
    fetch(`https://www.emsifa.com/api-wilayah-indonesia/v2/villages/${districtId}.json`)
      .then((res) => res.json())
      .then((resJson) => {
        const data = resJson.data || resJson;
        setVillages(
          data.map((item) => ({
            value: item.name,
            label: item.name,
            postalCode: item.postal_code,
          })),
        );

        const uniquePostals = Array.from(new Set(data.map((item) => item.postal_code)))
          .filter(Boolean)
          .map((code) => ({ value: code, label: code }));
        setPostalCodes(uniquePostals);
      })
      .catch((err) => console.error('Failed to fetch villages:', err));
  }, [districtId]);

  // 5. Reverse flow: Postal Code change
  const handlePostalCodeChange = async (selectedPostal) => {
    const cleanedPostal = sanitizePostalCode(selectedPostal);
    setValue('postalCode', cleanedPostal);

    if (cleanedPostal.length === 5) {
      try {
        isSyncingFromPostal.current = true;
        const res = await fetch(
          `https://www.emsifa.com/api-wilayah-indonesia/v2/postal-codes/${cleanedPostal}.json`,
        );
        const resJson = await res.json();
        const data = resJson.data || resJson;

        if (Array.isArray(data) && data.length > 0) {
          const match = data[0];

          if (match.province) {
            setValue('province', match.province.name);
            setProvinceId(match.province.id);
            const regRes = await fetch(
              `https://www.emsifa.com/api-wilayah-indonesia/v2/regencies/${match.province.id}.json`,
            );
            const regJson = await regRes.json();
            setCities(
              (regJson.data || regJson).map((i) => ({ value: i.name, label: i.name, id: i.id })),
            );
          }

          if (match.regency) {
            setValue('city', match.regency.name);
            setCityId(match.regency.id);
            const distRes = await fetch(
              `https://www.emsifa.com/api-wilayah-indonesia/v2/districts/${match.regency.id}.json`,
            );
            const distJson = await distRes.json();
            setDistricts(
              (distJson.data || distJson).map((i) => ({ value: i.name, label: i.name, id: i.id })),
            );
          }

          if (match.district) {
            setValue('district', match.district.name);
            setDistrictId(match.district.id);
            const villRes = await fetch(
              `https://www.emsifa.com/api-wilayah-indonesia/v2/villages/${match.district.id}.json`,
            );
            const villJson = await villRes.json();
            setVillages(
              (villJson.data || villJson).map((i) => ({
                value: i.name,
                label: i.name,
                postalCode: i.postal_code,
              })),
            );
          }

          if (match.name) {
            setValue('village', match.name);
          }
        }
      } catch (err) {
        console.error('Failed to resolve region from postal code:', err);
      } finally {
        isSyncingFromPostal.current = false;
      }
    }
  };

  return (
    <section className="mt-12">
      <SectionTitle number="02" title="SHIPPING ADDRESS" />

      <div className="space-y-6">
        <FormField id="address" label="ADDRESS" error={errors.address}>
          <Input
            id="address"
            name="address"
            type="text"
            autoComplete="shipping street-address"
            placeholder="Street, building, unit, RT/RW, etc."
            value={form.address}
            onChange={(event) => setValue('address', event.target.value)}
            onBlur={() => handleBlur('address')}
            error={Boolean(errors.address)}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* PROVINCE */}
          <FormField id="province" label="PROVINCE" error={errors.province}>
            <ComboBox
              id="province"
              value={form.province}
              options={provinces}
              autoComplete="shipping address-level1"
              placeholder="SELECT PROVINCE"
              onChange={(value) => {
                if (isSyncingFromPostal.current) return;
                setValue('province', value);
                const selectedProv = provinces.find((p) => p.value === value);
                setProvinceId(selectedProv?.id || '');

                setValue('city', '');
                setCityId('');
                setValue('district', '');
                setDistrictId('');
                setValue('village', '');
                setValue('postalCode', '');
              }}
              onBlur={() => handleBlur('province')}
              error={Boolean(errors.province)}
            />
          </FormField>

          {/* CITY */}
          <FormField id="city" label="CITY" error={errors.city}>
            <ComboBox
              id="city"
              value={form.city}
              options={cities}
              disabled={!provinceId}
              autoComplete="shipping address-level2"
              placeholder="SELECT CITY"
              onChange={(value) => {
                if (isSyncingFromPostal.current) return;
                setValue('city', value);
                const selectedCity = cities.find((c) => c.value === value);
                setCityId(selectedCity?.id || '');

                setValue('district', '');
                setDistrictId('');
                setValue('village', '');
                setValue('postalCode', '');
              }}
              onBlur={() => handleBlur('city')}
              error={Boolean(errors.city)}
            />
          </FormField>

          {/* DISTRICT */}
          <FormField id="district" label="DISTRICT" error={errors.district}>
            <ComboBox
              id="district"
              value={form.district}
              options={districts}
              disabled={!cityId}
              autoComplete="shipping address-level3"
              placeholder="SELECT DISTRICT"
              onChange={(value) => {
                if (isSyncingFromPostal.current) return;
                setValue('district', value);
                const selectedDist = districts.find((d) => d.value === value);
                setDistrictId(selectedDist?.id || '');

                setValue('village', '');
                setValue('postalCode', '');
              }}
              onBlur={() => handleBlur('district')}
              error={Boolean(errors.district)}
            />
          </FormField>

          {/* VILLAGE */}
          <FormField id="village" label="SUB-DISTRICT / VILLAGE" error={errors.village}>
            <ComboBox
              id="village"
              value={form.village}
              options={villages}
              disabled={!districtId}
              autoComplete="shipping address-level4"
              placeholder="SELECT SUB_DISTRICT"
              onChange={(value) => {
                if (isSyncingFromPostal.current) return;
                setValue('village', value);
                const selectedVillage = villages.find((v) => v.value === value);
                if (selectedVillage && selectedVillage.postalCode) {
                  setValue('postalCode', selectedVillage.postalCode);
                }
              }}
              onBlur={() => handleBlur('village')}
              error={Boolean(errors.village)}
            />
          </FormField>

          {/* POSTAL CODE */}
          <FormField id="postalCode" label="POSTAL CODE" error={errors.postalCode} className="md:col-span-2">
            <ComboBox
              id="postalCode"
              value={form.postalCode}
              autoComplete="shipping postal-code"
              options={postalCodes}
              placeholder="Select or type postal code (e.g. 40152)"
              onChange={handlePostalCodeChange}
              onBlur={() => handleBlur('postalCode')}
              error={Boolean(errors.postalCode)}
            />
          </FormField>
        </div>
      </div>
    </section>
  );
}

function SectionTitle({ number, title }) {
  return (
    <div className="border-border-subtle mb-7 flex items-center gap-3 border-b pb-4">
      <span className="font-technical-data text-text-muted">{number}</span>
      <h2 className="font-label-caps text-primary tracking-widest">{title}</h2>
    </div>
  );
}
