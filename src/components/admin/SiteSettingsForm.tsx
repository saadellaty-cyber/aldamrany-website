'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateSiteSettings } from '@/app/admin/(dashboard)/settings/actions';
import { BilingualField, CheckboxField, TextField } from '@/components/admin/fields';
import { ImagePicker } from '@/components/admin/ImagePicker';
import {
  AdminButton,
  FieldGrid,
  FormMessage,
  Panel,
  PanelHeader,
} from '@/components/admin/ui';
import type { ActionResult } from '@/lib/admin/forms';

export type SettingsImage = { id: string; url: string; name: string } | null;

export type SiteSettingsValues = {
  companyNameAr: string | null;
  companyNameEn: string | null;
  taglineAr: string | null;
  taglineEn: string | null;
  phone: string | null;
  mobile: string | null;
  email: string | null;
  whatsappNumber: string | null;
  whatsappFloatingEnabled: boolean;
  headOfficeAr: string | null;
  headOfficeEn: string | null;
  branchAr: string | null;
  branchEn: string | null;
  googleMapsUrl: string | null;
  defaultSeoTitleAr: string | null;
  defaultSeoTitleEn: string | null;
  defaultSeoDescriptionAr: string | null;
  defaultSeoDescriptionEn: string | null;
  analyticsId: string | null;
  googleVerification: string | null;
  maintenanceMode: boolean;
  showIcons: boolean;
  logoPrimary: SettingsImage;
  logoDark: SettingsImage;
  logoLight: SettingsImage;
  logoMobile: SettingsImage;
  favicon: SettingsImage;
  ogImage: SettingsImage;
};

const initialState: ActionResult = { ok: true };

export function SiteSettingsForm({
  values,
  canToggleMaintenance,
}: {
  values: SiteSettingsValues;
  canToggleMaintenance: boolean;
}) {
  const [state, formAction] = useActionState(updateSiteSettings, initialState);
  const fieldError = (name: string) => state.errors?.[name];

  return (
    <form action={formAction} className="space-y-6 pb-24">
      {state.message ? (
        <FormMessage tone={state.ok ? 'success' : 'error'}>{state.message}</FormMessage>
      ) : null}

      <Panel className="space-y-5">
        <PanelHeader title="Company" />
        <BilingualField
          label="Company name"
          nameAr="companyNameAr"
          nameEn="companyNameEn"
          defaultAr={values.companyNameAr}
          defaultEn={values.companyNameEn}
        />
        <BilingualField
          label="Tagline"
          nameAr="taglineAr"
          nameEn="taglineEn"
          defaultAr={values.taglineAr}
          defaultEn={values.taglineEn}
        />
      </Panel>

      <Panel className="space-y-5">
        <PanelHeader
          title="Contact details"
          description="Only the fields you fill in appear on the website. Leave anything you do not want published empty."
        />

        <FieldGrid>
          <TextField
            label="Phone"
            name="phone"
            dir="ltr"
            defaultValue={values.phone ?? ''}
            placeholder="+20 3 000 0000"
          />
          <TextField
            label="Mobile"
            name="mobile"
            dir="ltr"
            defaultValue={values.mobile ?? ''}
            placeholder="+20 100 000 0000"
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            dir="ltr"
            defaultValue={values.email ?? ''}
          />
          <TextField
            label="WhatsApp number"
            name="whatsappNumber"
            dir="ltr"
            defaultValue={values.whatsappNumber ?? ''}
            placeholder="201234567890"
            help={
              fieldError('whatsappNumber') ??
              'Country code followed by the number, digits only. The wa.me link is built automatically.'
            }
          />
        </FieldGrid>

        <CheckboxField
          label="Show the floating WhatsApp button on the website"
          name="whatsappFloatingEnabled"
          defaultChecked={values.whatsappFloatingEnabled}
          help="Only appears once a WhatsApp number has been saved."
        />

        <BilingualField
          label="Head office address"
          nameAr="headOfficeAr"
          nameEn="headOfficeEn"
          defaultAr={values.headOfficeAr}
          defaultEn={values.headOfficeEn}
          multiline
          rows={2}
        />

        <BilingualField
          label="Branch address"
          nameAr="branchAr"
          nameEn="branchEn"
          defaultAr={values.branchAr}
          defaultEn={values.branchEn}
          multiline
          rows={2}
        />

        <TextField
          label="Google Maps link"
          name="googleMapsUrl"
          dir="ltr"
          defaultValue={values.googleMapsUrl ?? ''}
          placeholder="https://maps.app.goo.gl/…"
          help={fieldError('googleMapsUrl')}
        />
      </Panel>

      <Panel className="space-y-6">
        <PanelHeader
          title="Logo"
          description="The website picks the right version automatically. If nothing is uploaded, a typographic EL DAMARANY wordmark is used."
        />

        <div className="grid gap-6 md:grid-cols-2">
          <ImagePicker
            name="logoPrimary"
            label="Primary logo"
            description="Used wherever no specific version is set."
            initial={values.logoPrimary}
            aspect="aspect-[3/1]"
          />
          <ImagePicker
            name="logoDark"
            label="Logo for dark backgrounds"
            description="Shown in the header and footer."
            initial={values.logoDark}
            aspect="aspect-[3/1]"
          />
          <ImagePicker
            name="logoLight"
            label="Logo for light backgrounds"
            initial={values.logoLight}
            aspect="aspect-[3/1]"
          />
          <ImagePicker
            name="logoMobile"
            label="Compact logo"
            description="Optional, for narrow screens."
            initial={values.logoMobile}
            aspect="aspect-square"
          />
          <ImagePicker
            name="favicon"
            label="Browser icon (favicon)"
            initial={values.favicon}
            aspect="aspect-square"
          />
        </div>
      </Panel>

      <Panel className="space-y-4">
        <PanelHeader
          title="Icons"
          description="Small icons appear beside services, sectors, capabilities and the quality themes. Each item's icon is chosen in its own editor; this switch turns them all on or off at once."
        />
        <CheckboxField
          label="Show icons on the website"
          name="showIcons"
          defaultChecked={values.showIcons}
          help="Turn this off for a purely typographic look. The icons you have chosen are kept, just hidden."
        />
      </Panel>

      <Panel className="space-y-5">
        <PanelHeader
          title="Search engines & sharing"
          description="Defaults used by any page that has no title or description of its own."
        />

        <BilingualField
          label="Default page title"
          nameAr="defaultSeoTitleAr"
          nameEn="defaultSeoTitleEn"
          defaultAr={values.defaultSeoTitleAr}
          defaultEn={values.defaultSeoTitleEn}
        />

        <BilingualField
          label="Default description"
          nameAr="defaultSeoDescriptionAr"
          nameEn="defaultSeoDescriptionEn"
          defaultAr={values.defaultSeoDescriptionAr}
          defaultEn={values.defaultSeoDescriptionEn}
          multiline
          rows={2}
        />

        <ImagePicker
          name="ogImage"
          label="Default sharing image"
          description="Shown when a link to the website is posted on social media."
          initial={values.ogImage}
        />

        <FieldGrid>
          <TextField
            label="Google Analytics ID"
            name="analyticsId"
            dir="ltr"
            defaultValue={values.analyticsId ?? ''}
            placeholder="G-XXXXXXXXXX"
            help="Leave empty to load no analytics at all."
          />
          <TextField
            label="Google site verification"
            name="googleVerification"
            dir="ltr"
            defaultValue={values.googleVerification ?? ''}
          />
        </FieldGrid>
      </Panel>

      <Panel className="space-y-4">
        <PanelHeader
          title="Maintenance mode"
          description="Closes the public website and shows a short notice instead. Signed-in staff keep full access."
        />
        <CheckboxField
          label="Turn on maintenance mode"
          name="maintenanceMode"
          defaultChecked={values.maintenanceMode}
          disabled={!canToggleMaintenance}
          help={
            canToggleMaintenance
              ? 'While this is on, the site is also removed from search engine indexes.'
              : 'Only administrators can change this.'
          }
        />
        {!canToggleMaintenance && values.maintenanceMode ? (
          <input type="hidden" name="maintenanceMode" value="on" />
        ) : null}
      </Panel>

      <SaveBar />
    </form>
  );
}

function SaveBar() {
  const { pending } = useFormStatus();

  return (
    <div className="sticky bottom-0 z-20 -mx-4 border-t border-[#e2e1dc] bg-white/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
      <div className="flex justify-end">
        <AdminButton type="submit" disabled={pending}>
          {pending ? 'Saving…' : 'Save settings'}
        </AdminButton>
      </div>
    </div>
  );
}
