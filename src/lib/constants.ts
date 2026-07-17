import { type Slide } from "@/components/carousel/SlideRenderer"

export const MOCK_SLIDES: Slide[] = [
  {
    slide: 1,
    composition: { alignment: "center", focus: "headline", style: "bold", accent: "pill", aspectRatio: "4:5" },
    title: "Artificial Intelligence",
    body_text: "Transforming the Future of Technology",
    image_keyword: "ai-future"
  },
  {
    slide: 2,
    composition: { alignment: "left", focus: "balanced", style: "minimalist", accent: "none", aspectRatio: "4:5" },
    title: "Key Benefits of AI",
    body_text: "Increased efficiency and productivity. Improved decision making. Cost reduction. Enhanced customer experience. Innovation acceleration.",
    image_keyword: "benefits"
  },
  {
    slide: 3,
    composition: { alignment: "left", focus: "balanced", style: "minimalist", accent: "line", aspectRatio: "4:5" },
    title: "Machine Learning",
    body_text: "Machines learn from data without being explicitly programmed. They improve performance through experience and pattern recognition.",
    image_keyword: "ml"
  },
  {
    slide: 4,
    composition: { alignment: "center", focus: "headline", style: "floating", accent: "none", aspectRatio: "4:5" },
    title: "Andrew Ng",
    body_text: "AI is the new electricity. Just as electricity transformed every industry a century ago, I believe AI will now transform every industry.",
    image_keyword: "quote"
  },
  {
    slide: 5,
    composition: { alignment: "center", focus: "headline", style: "bold", accent: "line", aspectRatio: "4:5" },
    title: "Start Your AI Journey",
    body_text: "Explore cutting-edge AI technologies and implement them in your organization today.",
    image_keyword: "cta"
  },
];
