import NewSchoolForm from '@/components/superadmin/NewSchoolForm'

export default function NewSchoolPage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold text-ink">Add new school</h1>
        <p className="text-sm text-secondary mt-0.5">
          Set up a new organisation and their admin login in one go.
        </p>
      </div>
      <NewSchoolForm />
    </div>
  )
}
