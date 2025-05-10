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
import { BrainCircuit, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface LLMModel {
  id: string;
  name: string;
  isPro?: boolean;
  dotColorClass?: string;
}

const availableModels: LLMModel[] = [
  { id: "googleai/gemini-1.5-pro-latest", name: "Gemini 1.5 Pro", isPro: true, dotColorClass: "bg-primary" },
  { id: "googleai/gemini-1.5-flash-latest", name: "Gemini 1.5 Flash", isPro: false, dotColorClass: "bg-green-500" },
  { id: "googleai/gemini-2.0-flash", name: "Gemini 2.0 Flash", isPro: false, dotColorClass: "bg-muted-foreground" },
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
    availableModels.find(m => m.id === selectedModelId)
  );

  useEffect(() => {
    setCurrentSelectedModel(availableModels.find(m => m.id === selectedModelId));
  }, [selectedModelId]);

  if (!currentSelectedModel) {
    // Fallback or loading state if needed, though selectedModelId should always be valid
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
          {commonT('modelLabelShort', { modelName: currentSelectedModel.name })}
          <BrainCircuit size={14} className="ml-1" />
          <ChevronDown size={14} className="ml-0.5 opacity-70" />
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
