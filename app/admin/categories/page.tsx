// app/admin/categories/page.tsx

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { storeManager } from "@/lib/store"
import { Plus, FolderPlus, X, Trash2, Edit, Loader2, ChevronDown, ChevronUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface Category {
  id: string
  name: string
  slug: string
  description: string
  subcategories?: Subcategory[]
  productCount?: number
}

interface Subcategory {
  id: string
  name: string
  slug: string
  description: string
  productCount?: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState<"category" | "subcategory" | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ name: "", description: "" })
  const [loading, setLoading] = useState(true)
  const [formErrors, setFormErrors] = useState({ name: "", description: "" })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const allCategories = await storeManager.getCategories()
        setCategories(allCategories)
      } catch (error) {
        toast.error("Failed to load categories", {
          description: "Please try again later"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
    const unsubscribe = storeManager.subscribe(fetchCategories)

    return () => unsubscribe()
  }, [])

  const validateForm = () => {
    const errors = { name: "", description: "" }
    let valid = true
    
    if (!formData.name.trim()) {
      errors.name = "Name is required"
      valid = false
    } else if (formData.name.length < 2) {
      errors.name = "Name must be at least 2 characters"
      valid = false
    }
    
    if (!formData.description.trim()) {
      errors.description = "Description is required"
      valid = false
    } else if (formData.description.length < 10) {
      errors.description = "Description must be at least 10 characters"
      valid = false
    }
    
    setFormErrors(errors)
    return valid
  }

  const resetForm = () => {
    setFormData({ name: "", description: "" })
    setFormErrors({ name: "", description: "" })
    setShowForm(null)
    setSelectedCategory(null)
    setEditingId(null)
    setIsEditing(false)
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      if (isEditing && editingId) {
        await storeManager.updateCategory(editingId, formData)
        toast.success("Category updated successfully")
      } else {
        await storeManager.addCategory(formData)
        toast.success("Category added successfully")
      }
      resetForm()
    } catch (error) {
      toast.error("Operation failed", {
        description: "Could not save category. Please try again."
      })
    }
  }

  const handleSubcategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || !selectedCategory) return

    try {
      if (isEditing && editingId) {
        await storeManager.updateSubcategory(editingId, formData)
        toast.success("Subcategory updated successfully")
      } else {
        await storeManager.addSubcategory(selectedCategory.id, formData)
        toast.success("Subcategory added successfully")
      }
      resetForm()
    } catch (error) {
      toast.error("Operation failed", {
        description: "Could not save subcategory. Please try again."
      })
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await storeManager.deleteCategory(categoryId)
      toast.success("Category deleted successfully")
    } catch (error) {
      toast.error("Deletion failed", {
        description: "Could not delete category. Please try again."
      })
    }
  }

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    try {
      await storeManager.deleteSubcategory(subcategoryId)
      toast.success("Subcategory deleted successfully")
    } catch (error) {
      toast.error("Deletion failed", {
        description: "Could not delete subcategory. Please try again."
      })
    }
  }

  const startEditing = (item: Category | Subcategory, type: "category" | "subcategory", category?: Category) => {
    setFormData({
      name: item.name,
      description: item.description
    })
    setEditingId(item.id)
    setIsEditing(true)
    
    if (type === "subcategory" && category) {
      setSelectedCategory(category)
      setShowForm("subcategory")
    } else {
      setShowForm("category")
    }
  }

  const toggleCategory = (categoryId: string) => {
    setOpenCategoryId(openCategoryId === categoryId ? null : categoryId)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Category Management</h1>
          <p className="text-sm text-muted-foreground">
            {categories.length} categories,{" "}
            {categories.reduce((acc, cat) => acc + (cat.subcategories?.length || 0), 0)} subcategories
          </p>
        </div>
        <Button onClick={() => {
          setShowForm("category")
          setIsEditing(false)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FolderPlus className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No categories yet</h3>
          <p className="text-muted-foreground mb-6">
            Start by adding your first product category
          </p>
          <Button onClick={() => setShowForm("category")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Category
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => (
            <Card key={category.id} className="overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center gap-3">
                  {openCategoryId === category.id ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    {category.name}
                    <Badge variant="secondary">
                      {category.subcategories?.length || 0} subcategories
                    </Badge>
                    {category.productCount !== undefined && (
                      <Badge variant="outline">
                        {category.productCount} products
                      </Badge>
                    )}
                  </h3>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="icon" 
                    variant="outline"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      startEditing(category, "category")
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="destructive"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteCategory(category.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {openCategoryId === category.id && (
                <CardContent className="p-4 pt-2">
                  <p className="text-muted-foreground mb-4">{category.description}</p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-sm text-gray-700">Subcategories</h4>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedCategory(category)
                        setShowForm("subcategory")
                        setIsEditing(false)
                      }}
                    >
                      <FolderPlus className="h-3 w-3 mr-2" />
                      Add Subcategory
                    </Button>
                  </div>

                  {category.subcategories?.length ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {category.subcategories.map((subcategory) => (
                        <div key={subcategory.id} className="border rounded-lg p-3 flex justify-between items-start">
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {subcategory.name}
                              {subcategory.productCount !== undefined && (
                                <Badge variant="outline" className="text-xs">
                                  {subcategory.productCount} products
                                </Badge>
                              )}
                            </div>
                            <div className="text-muted-foreground text-sm mt-1">
                              {subcategory.description}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              size="icon" 
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => startEditing(subcategory, "subcategory", category)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost"
                              className="h-6 w-6 text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteSubcategory(subcategory.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      No subcategories yet
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Category Form Modal */}
      {(showForm === "category" || showForm === "subcategory") && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {isEditing 
                    ? `Edit ${showForm === "category" ? "Category" : "Subcategory"}` 
                    : `Add New ${showForm === "category" ? "Category" : "Subcategory"}`}
                </h2>
                <Button variant="outline" size="icon" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form 
                onSubmit={showForm === "category" ? handleCategorySubmit : handleSubcategorySubmit} 
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {showForm === "category" ? "Category" : "Subcategory"} Name
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder={`Enter ${showForm === "category" ? "category" : "subcategory"} name`}
                    className={formErrors.name ? "border-red-500" : ""}
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Enter description"
                    className={formErrors.description ? "border-red-500" : ""}
                    rows={3}
                  />
                  {formErrors.description && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
                  )}
                </div>

                {showForm === "subcategory" && selectedCategory && (
                  <div className="p-3 bg-muted/50 rounded-lg text-sm">
                    <p className="font-medium">Parent Category</p>
                    <p className="font-semibold">{selectedCategory.name}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {isEditing ? "Update" : "Add"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
