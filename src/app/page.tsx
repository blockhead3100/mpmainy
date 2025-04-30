
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
import { Copy, FileDown, Wand2, Download, Link as LinkIcon } from "lucide-react"; // Import Download and Link icons

export default function Home() {
  const [article, setArticle] = useState("");
  const [summary, setSummary] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [transcription, setTranscription] = useState("");
  const [conversionUrl, setConversionUrl] = useState("");
  const [convertedFormat, setConvertedFormat] = useState<YoutubeFormat | null>(null); // Track the format
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();

  const handleSummarize = async () => {
    setIsSummarizing(true);
    setSummary(""); // Clear previous summary
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
    if (!youtubeUrl) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a YouTube URL.",
      });
      return;
    }
    setIsTranscribing(true);
    setTranscription(""); // Clear previous transcription
    setConversionUrl(""); // Clear conversion URL if transcribing
    setConvertedFormat(null);
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
     if (!youtubeUrl) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a YouTube URL.",
      });
      return;
    }
    setIsConverting(true);
    setConversionUrl(""); // Clear previous URL
    setTranscription(""); // Clear transcription if converting
    setConvertedFormat(null);
    try {
      const result = await convertYoutube(youtubeUrl, format);
      setConversionUrl(result.url);
      setConvertedFormat(format); // Set the format
      toast({
        title: `YouTube video converted to ${format.toUpperCase()}!`,
        description: "The download link is ready.",
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
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({
      title: `${type} copied to clipboard!`,
      description: "You can now paste it anywhere.",
    });
  };

  const handleDownloadText = (text: string, filename: string) => {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" }); // Specify charset
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
     toast({
      title: "Download started!",
      description: `${filename} is being downloaded.`,
    });
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Article Summarizer & Media Converter</h1>

      <Tabs defaultValue="youtube" className="w-full max-w-2xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="youtube">YouTube Tools</TabsTrigger>
          <TabsTrigger value="article">Article Summarizer</TabsTrigger>
        </TabsList>

        {/* YouTube Tab */}
        <TabsContent value="youtube" className="mt-4 space-y-4">
          <Card className="shadow-md rounded-lg">
            <CardHeader>
              <CardTitle>YouTube Conversion & Transcription</CardTitle>
              <CardDescription>Paste a YouTube video link below.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                aria-label="YouTube URL Input"
              />
              <div className="flex flex-wrap gap-2 justify-center">
                {/* Button to convert to MP3 */}
                <Button onClick={() => handleConvert("mp3")} disabled={isConverting || isTranscribing || !youtubeUrl} className="flex-grow sm:flex-grow-0">
                  {isConverting && convertedFormat === 'mp3' ? "Converting..." : (isConverting ? "Processing..." : <><Download className="mr-2 h-4 w-4" />Convert to MP3</>)}
                </Button>
                {/* Button to convert to MP4 */}
                <Button onClick={() => handleConvert("mp4")} disabled={isConverting || isTranscribing || !youtubeUrl} className="flex-grow sm:flex-grow-0">
                   {isConverting && convertedFormat === 'mp4' ? "Converting..." : (isConverting ? "Processing..." : <><Download className="mr-2 h-4 w-4" />Convert to MP4</>)}
                </Button>
                 {/* Button to transcribe video */}
                <Button onClick={handleTranscribe} disabled={isTranscribing || isConverting || !youtubeUrl} className="flex-grow sm:flex-grow-0">
                  {isTranscribing ? "Transcribing..." : <><Wand2 className="mr-2 h-4 w-4" />Transcribe Video</>}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Display conversion result (MP3/MP4) */}
          {conversionUrl && convertedFormat && (
            <Card className="mt-4 shadow-md rounded-lg">
              <CardHeader>
                <CardTitle>Download Your File</CardTitle>
                 <CardDescription>Click the button to download the converted {convertedFormat.toUpperCase()} file.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                 <a
                    href={conversionUrl}
                    download // Add download attribute
                    target="_blank" // Good practice for external links/downloads
                    rel="noopener noreferrer"
                    className="flex-grow"
                  >
                   <Button className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download .{convertedFormat}
                   </Button>
                  </a>
                 <Button
                    variant="outline"
                    size="icon"
                    title={`Copy ${convertedFormat.toUpperCase()} Link`}
                    onClick={() => handleCopyToClipboard(conversionUrl, `${convertedFormat.toUpperCase()} Link`)}
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>
              </CardContent>
            </Card>
          )}

          {/* Display transcription result */}
          {transcription && (
            <Card className="mt-4 shadow-md rounded-lg">
              <CardHeader>
                <CardTitle>Transcription Result</CardTitle>
                <CardDescription>The transcribed text from the video.</CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-2">
                <div className="flex justify-end gap-2 mb-2">
                   <Button
                    variant="outline"
                    size="icon"
                    title="Copy Transcription"
                    onClick={() => handleCopyToClipboard(transcription, "Transcription")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                   <Button
                    variant="outline"
                    size="icon"
                    title="Download Transcription (.txt)"
                    onClick={() => handleDownloadText(transcription, "transcript.txt")}
                  >
                    <Download className="h-4 w-4" /> {/* Use Download icon */}
                  </Button>
                </div>
                <Textarea value={transcription} readOnly className="min-h-[150px] bg-muted/30 rounded-md p-3" aria-label="Transcription Output"/>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Article Summarizer Tab */}
        <TabsContent value="article" className="mt-4 space-y-4">
          <Card className="shadow-md rounded-lg">
            <CardHeader>
              <CardTitle>Article Summarization</CardTitle>
              <CardDescription>Paste the article text below to generate a summary.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Textarea
                value={article}
                onChange={(e) => setArticle(e.target.value)}
                placeholder="Paste your full article text here..."
                className="min-h-[150px] rounded-md"
                aria-label="Article Input"
              />
              <Button onClick={handleSummarize} disabled={isSummarizing || !article}>
                {isSummarizing ? "Summarizing..." : <><Wand2 className="mr-2 h-4 w-4" />Summarize Article</>}
              </Button>
            </CardContent>
          </Card>

          {summary && (
            <Card className="mt-4 shadow-md rounded-lg">
              <CardHeader>
                <CardTitle>Summary Result</CardTitle>
                <CardDescription>The generated summary of your article.</CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-2">
                 <div className="flex justify-end gap-2 mb-2">
                   <Button
                     variant="outline"
                     size="icon"
                     title="Copy Summary"
                     onClick={() => handleCopyToClipboard(summary, "Summary")}
                   >
                     <Copy className="h-4 w-4" />
                   </Button>
                    <Button
                     variant="outline"
                     size="icon"
                      title="Download Summary (.txt)"
                     onClick={() => handleDownloadText(summary, "summary.txt")}
                   >
                     <Download className="h-4 w-4" /> {/* Use Download icon */}
                   </Button>
                 </div>
                <Textarea value={summary} readOnly className="min-h-[150px] bg-muted/30 rounded-md p-3" aria-label="Summary Output"/>
              </CardContent>
            </Card>
          )}
        </TabsContent>

      </Tabs>
    </div>
  );
}
