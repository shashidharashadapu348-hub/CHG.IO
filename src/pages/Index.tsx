import { useState } from "react";
import { GraduationCap, BookOpen, FileText, Image, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import FileDropZone from "@/components/FileDropZone";
import LoadingState from "@/components/LoadingState";
import ResultsView from "@/components/ResultsView";
import type { AppState, CalendarAnalysis, InputMode } from "@/types/calendar";

const Index = () => {
  const [appState, setAppState] = useState<AppState>("upload");
  const [inputMode, setInputMode] = useState<InputMode>("pdf");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [results, setResults] = useState<CalendarAnalysis | null>(null);

  const handleAnalyze = async () => {
    if (inputMode === "text" && !text.trim()) {
      toast.error("Please paste some calendar text first.");
      return;
    }
    if (inputMode !== "text" && !file) {
      toast.error("Please upload a file first.");
      return;
    }

    setAppState("loading");

    try {
      let body: any;

      if (inputMode === "text") {
        body = { calendarText: text };
      } else {
        // Convert file to base64
        const buffer = await file!.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
        );
        body = {
          fileBase64: base64,
          fileName: file!.name,
          fileType: file!.type,
        };
      }

      const { data, error } = await supabase.functions.invoke("analyze-calendar", { body });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResults(data as CalendarAnalysis);
      setAppState("results");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong. Please try again.");
      setAppState("upload");
    }
  };

  const handleReset = () => {
    setAppState("upload");
    setFile(null);
    setText("");
    setResults(null);
  };

  if (appState === "loading") return <LoadingState />;
  if (appState === "results" && results)
    return <ResultsView data={results} onReset={handleReset} />;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="bg-primary px-4 pb-16 pt-12 text-center text-primary-foreground">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="flex justify-center">
            <GraduationCap className="h-12 w-12" />
          </div>
          <h1 className="text-4xl font-bold font-serif sm:text-5xl">
            Academic Calendar Analyzer
          </h1>
          <p className="text-lg opacity-90">
            Upload your academic calendar and instantly get a clear summary of
            every holiday, break, and non-instructional day — ready to export.
          </p>
        </div>
      </header>

      {/* Upload Section */}
      <main className="mx-auto -mt-8 max-w-2xl px-4 pb-16">
        <div className="rounded-xl border bg-card p-6 shadow-lg sm:p-8">
          <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>Choose how to provide your academic calendar</span>
          </div>

          <Tabs
            value={inputMode}
            onValueChange={(v) => {
              setInputMode(v as InputMode);
              setFile(null);
              setText("");
            }}
          >
            <TabsList className="mb-6 w-full">
              <TabsTrigger value="pdf" className="flex-1 gap-1.5">
                <FileText className="h-4 w-4" /> PDF
              </TabsTrigger>
              <TabsTrigger value="image" className="flex-1 gap-1.5">
                <Image className="h-4 w-4" /> Image
              </TabsTrigger>
              <TabsTrigger value="text" className="flex-1 gap-1.5">
                <Type className="h-4 w-4" /> Paste Text
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pdf">
              <FileDropZone
                accept=".pdf"
                label="Drop a PDF here"
                onFile={setFile}
                file={file}
              />
            </TabsContent>

            <TabsContent value="image">
              <FileDropZone
                accept=".jpg,.jpeg,.png,.webp"
                label="Drop an image here"
                onFile={setFile}
                file={file}
              />
            </TabsContent>

            <TabsContent value="text">
              <Textarea
                placeholder="Paste your academic calendar text here…"
                className="min-h-[200px] font-sans"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </TabsContent>
          </Tabs>

          <Button
            size="lg"
            className="mt-6 w-full text-base"
            onClick={handleAnalyze}
          >
            Analyze Calendar
          </Button>
        </div>

        {/* Sample Preview */}
        <div className="mt-10 text-center text-sm text-muted-foreground">
          <p className="mb-2 font-medium">What you'll get:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {["Visual calendar with holidays highlighted", "Sortable holiday table", "Export to .ics & .csv"].map((item) => (
              <span
                key={item}
                className="rounded-full border bg-muted/50 px-3 py-1 text-xs"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
