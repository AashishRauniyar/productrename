/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, Upload, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import Navbar from "@/components/navbar";

export default function UploadPage() {
  const [formData, setFormData] = useState({
    old_name: "",
    new_name: "",
    description: "",
    next_redirect_url: "",
    theme: "light",
    old_images: [] as File[],
    new_images: [] as File[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedProductId, setSavedProductId] = useState<number | null>(null);
  const [oldImagePreviews, setOldImagePreviews] = useState<string[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("details");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleThemeChange = (theme: string) => {
    setFormData((prev) => ({ ...prev, theme }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "old" | "new"
  ) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({
      ...prev,
      [type === "old" ? "old_images" : "new_images"]: files,
    }));

    // Generate image previews
    const previews = files.map((file) => URL.createObjectURL(file));
    if (type === "old") {
      setOldImagePreviews(previews);
    } else {
      setNewImagePreviews(previews);
    }
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsSubmitting(true);

  //   const data = new FormData();
  //   data.append("old_name", formData.old_name);
  //   data.append("new_name", formData.new_name);
  //   data.append("description", formData.description);
  //   data.append("next_redirect_url", formData.next_redirect_url);
  //   data.append("theme", formData.theme);

  //   formData.old_images.forEach((file) => data.append("old_images", file));
  //   formData.new_images.forEach((file) => data.append("new_images", file));

  //   try {
  //     const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  //     const res = await axios.post(`${baseUrl}/api/upload`, data, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     });
  //     if (res.status === 200) {
  //       const productId = res.data.id;
  //       setSavedProductId(productId);
  //     }
  //   } catch (error) {
  //     console.error("Upload error:", error);
  //     alert("Upload failed. Please try again.");
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    data.append("old_name", formData.old_name);
    data.append("new_name", formData.new_name);
    data.append("description", formData.description);
    data.append("next_redirect_url", formData.next_redirect_url);
    data.append("theme", formData.theme);

    formData.old_images.forEach((file) => data.append("old_images", file));
    formData.new_images.forEach((file) => data.append("new_images", file));

    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
      const res = await axios.post(`${baseUrl}/api/upload`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 200) {
        const productId = res.data.id;
        setSavedProductId(productId);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (savedProductId) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[70vh]">
        <Card className="w-full max-w-xl">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Upload Successful!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6">
              Your product has been uploaded successfully with ID:{" "}
              {savedProductId}
            </p>
            {formData.next_redirect_url && (
              <p className="mb-6">
                You can view your product at:{" "}
                <a
                  href={formData.next_redirect_url}
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {formData.next_redirect_url}
                </a>
              </p>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              onClick={() => {
                setSavedProductId(null);
                setFormData({
                  old_name: "",
                  new_name: "",
                  description: "",
                  next_redirect_url: "",
                  theme: "light",
                  old_images: [],
                  new_images: [],
                });
                setOldImagePreviews([]);
                setNewImagePreviews([]);
                setActiveTab("details");
              }}
            >
              Upload Another Product
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Product Image Comparison Upload
        </h2>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl">Upload Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="details">Product Details</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-6">
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="old_name">Old Product Name</Label>
                      <Input
                        id="old_name"
                        type="text"
                        name="old_name"
                        value={formData.old_name}
                        placeholder="Enter old product name"
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new_name">New Product Name</Label>
                      <Input
                        id="new_name"
                        type="text"
                        name="new_name"
                        value={formData.new_name}
                        placeholder="Enter new product name"
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      placeholder="Enter product description"
                      onChange={handleChange}
                      required
                      className="min-h-[120px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="next_redirect_url">
                      Next Redirect URL (Optional)
                    </Label>
                    <Input
                      id="next_redirect_url"
                      type="url"
                      name="next_redirect_url"
                      value={formData.next_redirect_url}
                      placeholder="https://example.com/product"
                      onChange={handleChange}
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button
                      type="button"
                      onClick={() => setActiveTab("images")}
                    >
                      Next: Upload Images
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="images" className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="old_images">Old Product Images</Label>
                      <Input
                        id="old_images"
                        type="file"
                        name="old_images"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileChange(e, "old")}
                        required
                        className="cursor-pointer"
                      />
                      {oldImagePreviews.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-500 mb-2">
                            Selected Old Product images:
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {oldImagePreviews.map((src, index) => (
                              <div
                                key={index}
                                className="relative aspect-square rounded-md overflow-hidden border"
                              >
                                <img
                                  src={src || "/placeholder.svg"}
                                  alt={`Old image preview ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new_images">New Product Images</Label>
                      <Input
                        id="new_images"
                        type="file"
                        name="new_images"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileChange(e, "new")}
                        required
                        className="cursor-pointer"
                      />
                      {newImagePreviews.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-500 mb-2">
                            Selected New Product images:
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {newImagePreviews.map((src, index) => (
                              <div
                                key={index}
                                className="relative aspect-square rounded-md overflow-hidden border"
                              >
                                <img
                                  src={src || "/placeholder.svg"}
                                  alt={`New image preview ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("details")}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setActiveTab("appearance")}
                    >
                      Next: Appearance
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="appearance" className="space-y-6">
                  <div className="space-y-4">
                    <Label>Theme Color</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all",
                          formData.theme === "light"
                            ? "border-primary bg-primary/10"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                        onClick={() => handleThemeChange("light")}
                      >
                        <Sun className="h-10 w-10 mb-2" />
                        <span className="font-medium">Light</span>
                      </div>
                      <div
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all",
                          formData.theme === "dark"
                            ? "border-primary bg-primary/10"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                        onClick={() => handleThemeChange("dark")}
                      >
                        <Moon className="h-10 w-10 mb-2" />
                        <span className="font-medium">Dark</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("images")}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="min-w-[120px]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
