
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface LLMModel {
  id: string;
  name: string;
  isPro?: boolean;
  dotColorClass?: string;
}

// Updated list of available models
const availableModels: LLMModel[] = [
  // Existing models, now marked as Pro
  { id: "openrouter/o4-mini-high", name: "o4-mini-high", isPro: true, dotColorClass: "bg-muted-foreground" },
  { id: "openrouter/claude-3.7-thinking", name: "Claude 3.7 Thinking", isPro: true, dotColorClass: "bg-muted-foreground" },
  { id: "openrouter/gpt-4.5-turbo", name: "GPT 4.5", isPro: true, dotColorClass: "bg-muted-foreground" },
  { id: "openrouter/gemini-2.5-pro", name: "Gemini 2.5 Pro", isPro: true, dotColorClass: "bg-muted-foreground" },
  { id: "openrouter/grok-3", name: "Grok 3", isPro: true, dotColorClass: "bg-muted-foreground" },
  { id: "openrouter/claude-3.7", name: "Claude 3.7", isPro: true, dotColorClass: "bg-muted-foreground" },
  { id: "openrouter/gpt-4.1-preview", name: "GPT 4.1", isPro: true, dotColorClass: "bg-muted-foreground" },
  { id: "openrouter/grok-3-mini", name: "Grok 3 Mini", isPro: true, dotColorClass: "bg-yellow-400" },
  { id: "googleai/gemini-1.5-pro-latest", name: "Gemini 1.5 Pro", isPro: true, dotColorClass: "bg-primary" },
  { id: "googleai/gemini-1.5-flash-latest", name: "Gemini 1.5 Flash", isPro: true, dotColorClass: "bg-green-500" },
  { id: "googleai/gemini-2.0-flash", name: "Gemini 2.0 Flash", isPro: true, dotColorClass: "bg-muted-foreground" }, // Default model, now also Pro

  // New free OpenRouter models
  { id: "openrouter/nous-hermes-2-mixtral-8x7b-dpo", name: "Nous Hermes 2 Mixtral DPO", isPro: false, dotColorClass: "bg-sky-500" },
  { id: "openrouter/mistral-7b-instruct-v0.2", name: "Mistral 7B Instruct", isPro: false, dotColorClass: "bg-sky-500" },
  { id: "openrouter/openchat-3.5", name: "OpenChat 3.5", isPro: false, dotColorClass: "bg-sky-500" },
  { id: "openrouter/huggingfaceh4/zephyr-7b-beta", name: "Zephyr 7B Beta", isPro: false, dotColorClass: "bg-sky-500" },
];

export const defaultModelId = "googleai/gemini-2.0-flash"; 

interface ModelSelectorProps {
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
}

export function ModelSelector({ selectedModelId, onModelChange }: ModelSelectorProps) {
  const t = useTranslations("ModelSelector");
  const commonT = useTranslations("Common");
  
  const [currentSelectedModel, setCurrentSelectedModel] = useState<LLMModel | undefined>(
    availableModels.find(m => m.id === selectedModelId) || availableModels.find(m => m.id === defaultModelId)
  );

  useEffect(() => {
    const model = availableModels.find(m => m.id === selectedModelId);
    if (model) {
      setCurrentSelectedModel(model);
    } else {
      // If selectedModelId is not in the list (e.g. old value from localStorage), fallback to default
      const defaultModel = availableModels.find(m => m.id === defaultModelId);
      setCurrentSelectedModel(defaultModel);
      if (selectedModelId !== defaultModelId && defaultModel) { // Notify parent if current selection is invalid
          onModelChange(defaultModel.id);
      }
    }
  }, [selectedModelId, onModelChange]);

  if (!currentSelectedModel) {
    // Should not happen if defaultModelId is always in availableModels
    return null; 
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center text-xs text-muted-foreground p-1 h-auto hover:bg-muted focus-visible:ring-0 focus-visible:ring-offset-0"
          aria-label={commonT('modelLabel', { modelName: currentSelectedModel.name })}
        >
          <span className={cn("w-2 h-2 rounded-full mr-1.5 flex-shrink-0", currentSelectedModel.dotColorClass)} />
          {commonT('modelLabelShort', { modelName: currentSelectedModel.name })}
          {currentSelectedModel.isPro && <Badge variant="outline" className="ml-1.5 text-xs px-1 py-0.5 bg-primary/10 text-primary border-primary/30 font-medium h-auto leading-tight">PRO</Badge>}
          <ChevronDown size={14} className="ml-1 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>{t('selectModel')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={selectedModelId} onValueChange={onModelChange}>
          {availableModels.map((model) => (
            <DropdownMenuRadioItem key={model.id} value={model.id} className="cursor-pointer">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <span className={cn("w-2.5 h-2.5 rounded-full mr-2.5 flex-shrink-0", model.dotColorClass)} />
                  <span className="text-sm">{model.name}</span>
                </div>
                {model.isPro && (
                  <Badge 
                    variant="outline" 
                    className="ml-2 text-xs px-1.5 py-0.5 bg-primary/10 text-primary border-primary/30 font-medium"
                  >
                    PRO
                  </Badge>
                )}
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

