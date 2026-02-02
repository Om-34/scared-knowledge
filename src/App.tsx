import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ScriptureLibrary from "./pages/ScriptureLibrary";
import Scripture from "./pages/Scripture";
import Chapter from "./pages/Chapter";
import Bookmarks from "./pages/Bookmarks";
import Study from "./pages/Study";
import Resources from "./pages/Resources";
import Dashboard from "./pages/Dashboard";
import VerseSearch from "./pages/VerseSearch";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/scriptures" element={<ScriptureLibrary />} />
          <Route path="/scripture/:scriptureName" element={<Scripture />} />
          <Route path="/scripture/:scriptureName/chapter/:chapterNumber" element={<Chapter />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/study" element={<Study />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/search" element={<VerseSearch />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
