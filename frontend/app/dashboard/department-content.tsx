// components/dashboard/department-content.tsx
interface DepartmentContentProps {
  department: string;
}

export function DepartmentContent({ department }: DepartmentContentProps) {
  return (
    <div className="space-y-4">
      <div className="bg-primary/10 p-6 rounded-lg text-center">
        <h3 className="text-xl font-semibold mb-2">Your Department</h3>
        <p className="text-2xl font-bold text-primary">{department}</p>
      </div>
      <div className="mt-4">
        <h4 className="font-medium mb-2">Department Contacts</h4>
        {/* You can add department-specific contacts or info here */}
      </div>
    </div>
  );
}
