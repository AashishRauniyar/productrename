"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge as UIBadge } from "@/components/ui/badge";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

type Product = {
  id: number;
  old_name: string;
  new_name: string;
  description: string;
  old_images: string;
  new_images: string;
};

export default function ProductRenamePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [timeLeft, setTimeLeft] = useState(10);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Fetch products
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data));

    // Set up countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          router.push("/next-page"); // Replace with your next page route
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleGoBack = () => {
    router.back();
  };

  const handleProceed = () => {
    router.push("/next-page"); // Replace with your next page route
  };

  const handleNextProduct = () => {
    if (currentProductIndex < products.length - 1) {
      setCurrentProductIndex((prev) => prev + 1);
    }
  };

  const handlePrevProduct = () => {
    if (currentProductIndex > 0) {
      setCurrentProductIndex((prev) => prev - 1);
    }
  };

  if (products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const product = products[currentProductIndex];

  return (
    <main className="container mx-auto px-4 py-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Product Rename</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              Redirecting in {timeLeft}s
            </span>
            <Progress value={(10 - timeLeft) * 10} className="w-24" />
          </div>
        </div>

        {/* Product Navigation */}
        {products.length > 1 && (
          <div className="flex justify-center gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevProduct}
              disabled={currentProductIndex === 0}
            >
              Previous
            </Button>
            <UIBadge variant="outline" className="px-3">
              {currentProductIndex + 1} of {products.length}
            </UIBadge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextProduct}
              disabled={currentProductIndex === products.length - 1}
            >
              Next
            </Button>
          </div>
        )}

        <div className="bg-card border rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
            {/* Old Images - Left Side */}
            <div className="md:col-span-3 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {JSON.parse(product.old_images).map(
                  (img: string, index: number) => (
                    <div
                      key={index}
                      className="group relative aspect-square overflow-hidden rounded-md border hover:shadow-md transition-all duration-300"
                    >
                      <img
                        src={img || "/placeholder.svg"}
                        alt={`${product.old_name} image ${index + 1}`}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )
                )}
              </div>
              <div className="text-center">
                <UIBadge variant="secondary" className="mb-1">
                  Previous
                </UIBadge>
                <h3 className="text-lg font-medium">{product.old_name}</h3>
              </div>
            </div>

            {/* Center Column - Arrow Animation & Description */}
            <div className="md:col-span-1 flex flex-col items-center gap-4">
              <div className="relative w-16 h-16 flex items-center justify-center">
                {/* <MoveRight className="h-10 w-10 text-primary absolute animate-pulse" /> */}
                <DotLottieReact
                  src="https://lottie.host/b391a4de-9ffa-4c04-97e9-067f41af0c66/25aKPFzqQ2.lottie"
                  loop
                  autoplay
                />

                <div className="absolute w-12 h-1 bg-primary rounded-full animate-[ping_2s_ease-in-out_infinite]"></div>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                {product.description}
              </p>
            </div>

            {/* New Images - Right Side */}
            <div className="md:col-span-3 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {JSON.parse(product.new_images).map(
                  (img: string, index: number) => (
                    <div
                      key={index}
                      className="group relative aspect-square overflow-hidden rounded-md border hover:shadow-md transition-all duration-300"
                    >
                      <img
                        src={img || "/placeholder.svg"}
                        alt={`${product.new_name} image ${index + 1}`}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )
                )}
              </div>
              <div className="text-center">
                <UIBadge variant="default" className="mb-1">
                  New
                </UIBadge>
                <h3 className="text-lg font-medium">{product.new_name}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center">
            <Button
              variant="outline"
              size="lg"
              onClick={handleGoBack}
              className="mb-2 flex items-center gap-2"
            >
              <Badge className="h-5 w-5" />
              Go Back
            </Button>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-muted-foreground">
                Previous step
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <Button
              size="lg"
              onClick={handleProceed}
              className="mb-2 flex items-center gap-2"
            >
              <CheckCircle className="h-5 w-5" />
              Proceed to Next Page
            </Button>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-muted-foreground">
                Continue to checkout
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
