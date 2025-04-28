"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { convertYoutube, YoutubeFormat } from "@/services/youtube";
import { summarizeArticle } from "@/ai/flows/summarize-article";
import { transcribeYouTubeVideo } from "@/ai/flows/transcribe-youtube-video";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Copy, FileDown, Wand2 } from "lucide-react";

export default function Home() {
  const [article, setArticle] = useState("");
  const [summary, setSummary] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [transcription, setTranscription] = useState("");
  const [conversionUrl, setConversionUrl] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();

  const handleSummarize = async () => {
    setIsSummarizing(true);
    try {
      const result = await summarizeArticle({ article });
      setSummary(result.summary);
      toast({
        title: "Article summarized!",
        description: "The summary has been generated.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error summarizing article!",
        description: error.message,
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleTranscribe = async () => {
    setIsTranscribing(true);
    try {
      const result = await transcribeYouTubeVideo({ youtubeUrl });
      setTranscription(result.transcription);
      toast({
        title: "YouTube video transcribed!",
        description: "The transcription has been generated.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error transcribing YouTube video!",
        description: error.message,
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleConvert = async (format: YoutubeFormat) => {
    setIsConverting(true);
    try {
      const result = await convertYoutube(youtubeUrl, format);
      setConversionUrl(result.url);
      toast({
        title: `YouTube video converted to ${format.toUpperCase()}!`,
        description: "The conversion URL has been generated.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: `Error converting YouTube video to ${format.toUpperCase()}!`,
        description: error.message,
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleCopyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${type} copied to clipboard!`,
      description: "You can now paste it anywhere.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Article Summarizer and Media Converter</h1>

      <Tabs defaultValue="article" className="w-[100%]">
        <TabsList>
          <TabsTrigger value="article">Article Summarization</TabsTrigger>
          <TabsTrigger value="youtube">YouTube Conversion/Transcription</TabsTrigger>
        </TabsList>
        <TabsContent value="article" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Article Input</CardTitle>
              <CardDescription>Paste the article text here to summarize.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Textarea
                value={article}
                onChange={(e) => setArticle(e.target.value)}
                placeholder="Paste your article here..."
                className="min-h-[100px]"
              />
              <Button onClick={handleSummarize} disabled={isSummarizing}>
                {isSummarizing ? "Summarizing..." : <><Wand2 className="mr-2 h-4 w-4" />Summarize Article</>}
              </Button>
            </CardContent>
          </Card>

          {summary && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
                <CardDescription>Here is the summarized text.</CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopyToClipboard(summary, "Summary")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Textarea value={summary} readOnly className="min-h-[100px]" />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="youtube" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>YouTube Link Input</CardTitle>
              <CardDescription>Paste the YouTube video link here.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="Paste your YouTube link here..."
              />
              <div className="flex gap-2">
                <Button onClick={() => handleConvert("mp3")} disabled={isConverting}>
                  {isConverting ? "Converting..." : <><FileDown className="mr-2 h-4 w-4" />Convert to MP3</>}
                </Button>
                <Button onClick={() => handleConvert("mp4")} disabled={isConverting}>
                  {isConverting ? "Converting..." : <><FileDown className="mr-2 h-4 w-4" />Convert to MP4</>}
                </Button>
                <Button onClick={handleTranscribe} disabled={isTranscribing}>
                  {isTranscribing ? "Transcribing..." : <><Wand2 className="mr-2 h-4 w-4" />Transcribe Video</>}
                </Button>
              </div>
            </CardContent>
          </Card>

          {conversionUrl && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Conversion URL</CardTitle>
                <CardDescription>Here is the conversion URL.</CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopyToClipboard(conversionUrl, "Conversion URL")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Input type="text" value={conversionUrl} readOnly />
              </CardContent>
            </Card>
          )}

          {transcription && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Transcription</CardTitle>
                <CardDescription>Here is the transcribed text.</CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopyToClipboard(transcription, "Transcription")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Textarea value={transcription} readOnly className="min-h-[100px]" />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
