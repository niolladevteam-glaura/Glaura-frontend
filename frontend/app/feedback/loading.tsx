import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function FeedbackLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Skeleton */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Skeleton */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </CardContent>
            </Card>

            {/* Feedback Items Skeleton */}
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div>
                        <Skeleton className="h-6 w-48 mb-2" />
                        <div className="flex space-x-2">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-5 w-20" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                      </div>
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j}>
                        <Skeleton className="h-4 w-16 mb-1" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                    ))}
                  </div>
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
