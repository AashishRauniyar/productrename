/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import badge from "@/Image/Badge.png";

type Product = {
  id: number;
  old_name: string;
  new_name: string;
  description: string;
  old_images: string; // JSON-stringified array of file paths
  new_images: string; // JSON-stringified array of file paths
  next_redirect_url: string;
  theme: "light" | "dark";
  generated_link: string;
};

export default function ProductComparisonPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isSmallMobile = useMediaQuery("(max-width: 380px)");

  // Extract product ID from slug
  const getProductIdFromSlug = (slug: string) => {
    // The slug format is "name-id" or similar
    const parts = slug.split("-");
    return parts[parts.length - 1]; // The ID should be the last part
  };

  // Fetch product by slug using axios
  useEffect(() => {
    if (!slug) return;

    setIsLoading(true);
    setShowNewProduct(false);

    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // First, get all products
    axios
      .get("/api/products")
      .then((response) => {
        const products = response.data;

        if (!products || products.length === 0) {
          setError("No products found");
          setIsLoading(false);
          return;
        }

        // Find the current product by matching the slug or ID
        const productId = getProductIdFromSlug(slug);
        const currentProductIndex = products.findIndex(
          (p: Product) =>
            p.id.toString() === productId || p.generated_link?.includes(slug)
        );

        if (currentProductIndex === -1) {
          setError("Product not found");
          setIsLoading(false);
          return;
        }

        const currentProduct = products[currentProductIndex];

        setProduct(currentProduct);

        // Set theme based on the product's theme
        if (
          currentProduct.theme === "dark" ||
          currentProduct.theme === "light"
        ) {
          setTheme(currentProduct.theme);
          // Apply theme class to document
          if (currentProduct.theme === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }

        setIsLoading(false);
        setTimeLeft(10);

        // Show the new product with a slight delay after data loads
        setTimeout(() => {
          setShowNewProduct(true);
        }, 500);
      })
      .catch((error) => {
        console.error("Error fetching product:", error);
        setError("Error loading product");
        setIsLoading(false);
      });
  }, [slug]);

  // Timer useEffect
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!product) return;

    setTimeLeft(10);
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleProceed();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [product]);

  const handleGoBack = () => router.back();

  const handleProceed = () => {
    if (product?.next_redirect_url) {
      router.push(product.next_redirect_url);
    } else {
      router.push("/");
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex justify-center items-center min-h-screen"
        style={{ backgroundColor: theme === "dark" ? "#002147" : "white" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 dark:border-yellow-400 border-t-transparent"></div>
          <p className="text-black/80 dark:text-white/80 animate-pulse text-lg font-medium">
            Loading product information...
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div
        className="flex justify-center items-center min-h-screen"
        style={{ backgroundColor: theme === "dark" ? "#002147" : "white" }}
      >
        <Card
          className={`max-w-md w-full p-6 shadow-2xl border-red-500/20 ${
            theme === "dark" ? "dark bg-[#002147]/80" : "bg-white"
          }`}
        >
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <div className="rounded-full bg-red-600/10 dark:bg-yellow-400/10 p-4">
              <CheckCircle className="h-10 w-10 text-red-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-black dark:text-white">
              Product Not Found
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-300">
              {error || "The requested product could not be found."}
            </p>
            <Button
              onClick={handleGoBack}
              className="mt-4 w-full bg-red-600 hover:bg-red-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white dark:text-black"
            >
              Return to Previous Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Parse the JSON strings for images
  const oldImageSrc = (() => {
    try {
      const images = JSON.parse(product.old_images);
      return images && images.length > 0
        ? images[0]
        : "/placeholder.svg?height=280&width=280";
    } catch (e) {
      // If it's not valid JSON, it might be a single path string
      return product.old_images || "/placeholder.svg?height=280&width=280";
    }
  })();

  const newImageSrc = (() => {
    try {
      const images = JSON.parse(product.new_images);
      return images && images.length > 0
        ? images[0]
        : "/placeholder.svg?height=280&width=280";
    } catch (e) {
      // If it's not valid JSON, it might be a single path string
      return product.new_images || "/placeholder.svg?height=280&width=280";
    }
  })();

  // Determine image size based on screen size
  const imageSize = isMobile ? (isSmallMobile ? 140 : 160) : 280;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col min-h-screen text-black dark:text-white"
      style={{ backgroundColor: theme === "dark" ? "#002147" : "white" }}
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-red-600 dark:bg-red-600 text-white p-4 mb-4 rounded-b-lg flex justify-center items-center shadow-lg"
      >
        <h1 className="text-center text-base md:text-4xl font-extrabold">
          {product.old_name} has been renamed to {product.new_name}
        </h1>
      </motion.div>

      {/* Main Content Container with adjusted mobile spacing */}
      <div className="flex-1 flex flex-col justify-start md:justify-between overflow-hidden">
        {/* Products Section - Moved up on mobile */}
        <AnimatePresence mode="wait">
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={cn(
              "px-2 flex justify-center items-center",
              isMobile ? "mt-10" : "mt-4 flex-1"
            )}
          >
            <div
              className={cn("flex items-center", isMobile ? "gap-3" : "gap-8")}
            >
              {/* Old Product */}
              <div className="flex flex-col items-center relative">
                <Badge
                  variant="outline"
                  className={cn(
                    "mb-1 px-2 py-0.5 text-xs border-red-500 dark:border-yellow-400",
                    isMobile && "absolute -top-6"
                  )}
                >
                  OLD
                </Badge>
                <div
                  className="bg-transparent rounded-lg transition-all duration-300 shadow-lg overflow-hidden relative"
                  style={{ width: `${imageSize}px`, height: `${imageSize}px` }}
                >
                  <Image
                    src={oldImageSrc || "/placeholder.svg"}
                    alt={`Previous version: ${product.old_name}`}
                    width={imageSize * 1.2}
                    height={imageSize * 1.2}
                    className="object-contain w-full h-full"
                  />
                </div>
                <p
                  className={cn(
                    "mt-2 font-medium",
                    isMobile ? "text-xs" : "text-base"
                  )}
                >
                  {product.old_name}
                </p>
              </div>

              {/* Arrow Icons - Enhanced Animation */}
              <div className="flex items-center justify-center mx-1">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 flex items-center justify-center animate-arrow-1">
                    <ArrowRight
                      className={cn(
                        "text-red-600 dark:text-yellow-400",
                        isMobile ? "w-5 h-5" : "w-8 h-8"
                      )}
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center animate-arrow-2">
                    <ArrowRight
                      className={cn(
                        "text-red-600 dark:text-yellow-400",
                        isMobile ? "w-5 h-5" : "w-8 h-8"
                      )}
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center animate-arrow-3">
                    <ArrowRight
                      className={cn(
                        "text-red-600 dark:text-yellow-400",
                        isMobile ? "w-5 h-5" : "w-8 h-8"
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* New Product */}
              <div className="flex flex-col items-center relative ">
                <Badge
                  className={cn(
                    "mb-1 px-2 py-0.5 text-xs bg-red-600 dark:bg-yellow-500 text-white dark:text-black",
                    isMobile && "absolute -top-6  "
                  )}
                >
                  NEW
                </Badge>
                <AnimatePresence>
                  {showNewProduct && (
                    <motion.div
                      className="bg-transparent rounded-lg shadow-xl overflow-hidden relative"
                      style={{
                        width: `${imageSize}px`,
                        height: `${imageSize}px`,
                      }}
                      initial={{ scale: 0, opacity: 0, rotate: -10 }}
                      animate={{
                        scale: [0, 1.2, 1],
                        opacity: 1,
                        rotate: 0,
                        y: [0, -20, 0, -10, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        ease: "easeOut",
                      }}
                      whileInView={{
                        y: [0, -10, 0],
                        transition: {
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "reverse",
                        },
                      }}
                    >
                      <Image
                        src={newImageSrc || "/placeholder.svg"}
                        alt={`New version: ${product.new_name}`}
                        width={imageSize * 1.2}
                        height={imageSize * 1.2}
                        className="object-contain w-full h-full"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="absolute top-1 ml-40 rounded-full  p-0.5s">
                  <Badge
                    className={cn(
                      "mb-1 px-2 py-0.5 bg-transparent",
                      isMobile && "absolute -top-6"
                    )}
                  >
                    <Image
                      src={badge} // Replace with your image path
                      alt="badge-icon"
                      width={120} // Adjust the width as needed
                      height={120} // Adjust the height as needed
                      className=" inline-block"
                      style={{ backgroundColor: "transparent" }} // Ensures transparency for the logo's background
                    />
                  </Badge>
                </div>
                <p
                  className={cn(
                    "mt-2 font-medium text-red-600 dark:text-yellow-400",
                    isMobile ? "text-xs" : "text-base"
                  )}
                >
                  {product.new_name}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Description Section - Adjusted spacing for mobile */}
        <div
          className={cn(
            "flex flex-col justify-center items-center px-4",
            isMobile ? "mt-8" : "mt-6"
          )}
        >
          <motion.div
            className="w-full max-w-max"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <h2
              className={cn(
                "text-3xl font-bold text-center mb-3 text-red-600 dark:text-yellow-400",
                isMobile ? "text-xl" : "text-3xl"
              )}
            >
              Description
            </h2>
            <div className="bg-yellow-50/90 dark:bg-yellow-200/60 p-5 mx-auto rounded-xl shadow-lg">
              <p
                className={cn(
                  "text-center w-full",
                  isMobile ? "text-base leading-tight" : "text-xl"
                )}
              >
                {product.description ||
                  `We're thrilled to introduce ${product.new_name}. This rebranding marks a significant step in our journey
                towards enhancing the quality and trust in our products.`}
              </p>

              {/* Timer indicator */}
              <div className="mt-5 flex justify-center">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-[#002147]/80 rounded-full shadow-md">
                  <Clock className="h-4 w-4 text-red-600 dark:text-yellow-400 animate-pulse" />
                  <span className="text-sm font-medium">
                    Redirecting in{" "}
                    <span className="text-red-600 dark:text-yellow-400 font-bold">
                      {timeLeft}s
                    </span>
                  </span>
                  <Progress
                    value={(10 - timeLeft) * 10}
                    className="w-16 h-1.5"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Navigation Buttons - Adjusted for mobile */}
        <div
          className={cn(
            "flex justify-end items-center gap-4 px-6",
            isMobile ? "mt-6 pb-6" : "mt-8 pb-8"
          )}
        >
          <motion.button
            onClick={handleGoBack}
            className={cn(
              "bg-white/90 hover:bg-white dark:bg-[#002147]/80 dark:hover:bg-[#1a12a3] text-red-600 dark:text-yellow-400 rounded-full flex items-center justify-center font-medium shadow-lg",
              isMobile ? "px-5 py-2 text-sm" : "px-8 py-3 text-lg"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft
              className={cn(isMobile ? "w-4 h-4 mr-1" : "w-6 h-6 mr-2")}
            />
            <span>Back</span>
          </motion.button>
          <motion.button
            onClick={handleProceed}
            className={cn(
              "bg-red-600 hover:bg-red-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white dark:text-black rounded-full flex items-center justify-center font-medium shadow-lg",
              isMobile ? "px-5 py-2 text-sm" : "px-8 py-3 text-lg"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Proceed</span>
            <ChevronRight
              className={cn(isMobile ? "w-4 h-4 ml-1" : "w-6 h-6 ml-2")}
            />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
