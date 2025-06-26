import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card" 

export default function ComponentsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Components Showcase
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional UI components powered by shadcn/ui, ready for our SaaS platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Button Components</CardTitle>
              <CardDescription>
                Various button styles and variants
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Card Components</CardTitle>
              <CardDescription>
                Flexible container components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This is a card component with header, content, and footer sections.
                Perfect for displaying information in a structured way.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Card Action</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stage 1 Complete</CardTitle>
              <CardDescription>
                UI Foundation Successfully Added
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">shadcn/ui installed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Tailwind configured</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Components working</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">MVP still functional</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <a href="/">Back to MVP</a>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-muted-foreground">
            ✅ Stage 1 Complete - Ready for Stage 2: Database Foundation (Supabase)
          </p>
        </div>
      </div>
    </main>
  )
}