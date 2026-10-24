import { create } from "zustand";
import type {
  StudioDocument,
  StudioPage,
  StudioElement,
  StudioKind,
} from "@/lib/schemas/studio";
import { ARTBOARD_PRESETS } from "@/lib/schemas/studio";
import type { ResumeData } from "@/lib/schemas/resume";

const MAX_UNDO_STACK = 200;

export interface GuideLine {
  type: "vertical" | "horizontal";
  position: number;
}

export type StudioPanel =
  | "templates"
  | "elements"
  | "text"
  | "uploads"
  | "brand"
  | "layers"
  | "pages"
  | "content"
  | "ats"
  | null;

export interface StudioState {
  // Document state
  doc: StudioDocument;
  activePageIndex: number;
  designId: string | null;
  designTitle: string;
  kind: StudioKind;
  version: number;
  isDirty: boolean;
  saveStatus: "idle" | "saving" | "saved" | "error";
  isAnonymous: boolean;

  // Selection & Interaction
  selectedElementIds: string[];
  hoveredElementId: string | null;
  zoom: number;
  pan: { x: number; y: number };
  activeTool: "select" | "hand";
  activePanel: StudioPanel;
  activeGuides: GuideLine[];

  // Undo / Redo history
  undoStack: StudioDocument[];
  redoStack: StudioDocument[];

  // Actions
  setDoc: (doc: StudioDocument) => void;
  setDesignMeta: (id: string | null, title: string, kind: StudioKind, version?: number) => void;
  setIsAnonymous: (isAnonymous: boolean) => void;
  setActivePage: (index: number) => void;
  setSelectedElements: (ids: string[]) => void;
  selectElement: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  setHoveredElement: (id: string | null) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  setActiveTool: (tool: "select" | "hand") => void;
  setActivePanel: (panel: StudioPanel) => void;
  setActiveGuides: (guides: GuideLine[]) => void;
  setSaveStatus: (status: "idle" | "saving" | "saved" | "error") => void;

  // History Actions
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  // Element Mutators
  addElement: (element: StudioElement) => void;
  updateElement: (id: string, patch: Partial<StudioElement>) => void;
  updateSelectedElements: (patch: Partial<StudioElement>) => void;
  deleteSelectedElements: () => void;
  duplicateSelectedElements: () => void;
  reorderElementZ: (id: string, direction: "front" | "back" | "forward" | "backward") => void;
  alignSelectedElements: (direction: "left" | "center" | "right" | "top" | "middle" | "bottom") => void;

  // Page Mutators
  addPage: (page?: StudioPage) => void;
  duplicatePage: (index: number) => void;
  deletePage: (index: number) => void;
  reorderPage: (fromIndex: number, toIndex: number) => void;
  magicResize: (presetKey: string) => void;

  // High-value differentiator actions
  recolourToBrand: () => void;
  syncWithResumeData: (data: ResumeData) => void;
}

// Initial sample presentation slide
const createInitialDocument = (): StudioDocument => ({
  schemaVersion: 1,
  brandKit: {
    colors: ["#E6EEF4", "#5A4032", "#C9CCD1", "#DCD3F2", "#241915"],
    fonts: ["Plus Jakarta Sans", "Inter", "Space Grotesk"],
  },
  pages: [
    {
      id: "slide-1",
      name: "Cover Slide",
      width: 1920,
      height: 1080,
      background: "#FFFFFF",
      elements: [
        {
          id: "badge-1",
          name: "Category Badge",
          type: "shape",
          shapeType: "rect",
          x: 120,
          y: 220,
          width: 180,
          height: 38,
          rotation: 0,
          opacity: 1,
          locked: false,
          hidden: false,
          zIndex: 1,
          fill: "#DCD3F2",
          cornerRadius: 19,
        },
        {
          id: "badge-text",
          name: "Badge Label",
          type: "text",
          x: 140,
          y: 228,
          width: 140,
          height: 24,
          rotation: 0,
          opacity: 1,
          locked: false,
          hidden: false,
          zIndex: 2,
          content: "STARTUP PITCH",
          fontSize: 13,
          fontFamily: "Space Grotesk",
          fontWeight: 700,
          fontStyle: "normal",
          color: "#5A4032",
          align: "center",
          lineHeight: 1.2,
          letterSpacing: 1.5,
          underline: false,
          uppercase: true,
        },
        {
          id: "heading-1",
          name: "Pitch Title",
          type: "text",
          x: 120,
          y: 290,
          width: 900,
          height: 140,
          rotation: 0,
          opacity: 1,
          locked: false,
          hidden: false,
          zIndex: 3,
          content: "The Future of Design & Career Velocity",
          fontSize: 64,
          fontFamily: "Plus Jakarta Sans",
          fontWeight: 800,
          fontStyle: "normal",
          color: "#241915",
          align: "left",
          lineHeight: 1.1,
          letterSpacing: -1,
          underline: false,
          uppercase: false,
        },
        {
          id: "subtitle-1",
          name: "Deck Subtitle",
          type: "text",
          x: 120,
          y: 460,
          width: 800,
          height: 80,
          rotation: 0,
          opacity: 1,
          locked: false,
          hidden: false,
          zIndex: 4,
          content: "Empowering students, developers, and professionals to build world-class portfolios and decks in minutes.",
          fontSize: 22,
          fontFamily: "Inter",
          fontWeight: 400,
          fontStyle: "normal",
          color: "#5A4032",
          align: "left",
          lineHeight: 1.5,
          letterSpacing: 0,
          underline: false,
          uppercase: false,
        },
        {
          id: "hero-frame",
          name: "Cover Photo Frame",
          type: "frame",
          frameShape: "rounded",
          x: 1100,
          y: 180,
          width: 700,
          height: 720,
          rotation: 0,
          opacity: 1,
          locked: false,
          hidden: false,
          zIndex: 5,
          placeholderText: "Drop Product or Founder Photo",
          zoom: 1,
          cropX: 0,
          cropY: 0,
          borderColor: "#C9CCD1",
          borderWidth: 2,
        },
      ],
    },
  ],
});

export const useStudioStore = create<StudioState>((set, get) => ({
  doc: createInitialDocument(),
  activePageIndex: 0,
  designId: null,
  designTitle: "Untitled Presentation",
  kind: "deck",
  version: 1,
  isDirty: false,
  saveStatus: "saved",
  isAnonymous: false,

  selectedElementIds: [],
  hoveredElementId: null,
  zoom: 0.6,
  pan: { x: 0, y: 0 },
  activeTool: "select",
  activePanel: "templates",
  activeGuides: [],

  undoStack: [],
  redoStack: [],

  setDoc: (doc) => set({ doc, isDirty: false }),
  setDesignMeta: (id, title, kind, version) =>
    set((state) => ({
      designId: id,
      designTitle: title,
      kind,
      version: version ?? state.version,
    })),
  setIsAnonymous: (isAnonymous) => set({ isAnonymous }),
  setActivePage: (index) => set({ activePageIndex: index, selectedElementIds: [] }),
  setSelectedElements: (ids) => set({ selectedElementIds: ids }),
  selectElement: (id, multi) =>
    set((state) => {
      if (multi) {
        const already = state.selectedElementIds.includes(id);
        return {
          selectedElementIds: already
            ? state.selectedElementIds.filter((x) => x !== id)
            : [...state.selectedElementIds, id],
        };
      }
      return { selectedElementIds: [id] };
    }),
  clearSelection: () => set({ selectedElementIds: [] }),
  setHoveredElement: (id) => set({ hoveredElementId: id }),
  setZoom: (zoom) => set({ zoom: Math.min(Math.max(zoom, 0.1), 3.0) }),
  setPan: (pan) => set({ pan }),
  setActiveTool: (activeTool) => set({ activeTool }),
  setActivePanel: (activePanel) => set({ activePanel }),
  setActiveGuides: (activeGuides) => set({ activeGuides }),
  setSaveStatus: (saveStatus) => set({ saveStatus }),

  pushHistory: () => {
    const { doc, undoStack } = get();
    const cloned = JSON.parse(JSON.stringify(doc)) as StudioDocument;
    const nextStack = [...undoStack, cloned];
    if (nextStack.length > MAX_UNDO_STACK) nextStack.shift();
    set({ undoStack: nextStack, redoStack: [], isDirty: true });
  },

  undo: () => {
    const { undoStack, redoStack, doc } = get();
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    const newUndo = undoStack.slice(0, -1);
    const currentCloned = JSON.parse(JSON.stringify(doc)) as StudioDocument;
    set({
      doc: previous,
      undoStack: newUndo,
      redoStack: [currentCloned, ...redoStack],
      isDirty: true,
    });
  },

  redo: () => {
    const { undoStack, redoStack, doc } = get();
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    const newRedo = redoStack.slice(1);
    const currentCloned = JSON.parse(JSON.stringify(doc)) as StudioDocument;
    set({
      doc: next,
      undoStack: [...undoStack, currentCloned],
      redoStack: newRedo,
      isDirty: true,
    });
  },

  addElement: (element) => {
    get().pushHistory();
    const { doc, activePageIndex } = get();
    const pages = [...doc.pages];
    const activePage = { ...pages[activePageIndex] };
    const elements = [...activePage.elements, element];
    activePage.elements = elements;
    pages[activePageIndex] = activePage;
    set({ doc: { ...doc, pages }, selectedElementIds: [element.id] });
  },

  updateElement: (id, patch) => {
    const { doc, activePageIndex } = get();
    const pages = [...doc.pages];
    const activePage = { ...pages[activePageIndex] };
    const elements = activePage.elements.map((el) => {
      if (el.id === id) {
        return { ...el, ...patch } as StudioElement;
      }
      return el;
    });
    activePage.elements = elements;
    pages[activePageIndex] = activePage;
    set({ doc: { ...doc, pages }, isDirty: true });
  },

  updateSelectedElements: (patch) => {
    const { doc, activePageIndex, selectedElementIds } = get();
    if (selectedElementIds.length === 0) return;
    get().pushHistory();
    const pages = [...doc.pages];
    const activePage = { ...pages[activePageIndex] };
    const elements = activePage.elements.map((el) => {
      if (selectedElementIds.includes(el.id)) {
        return { ...el, ...patch } as StudioElement;
      }
      return el;
    });
    activePage.elements = elements;
    pages[activePageIndex] = activePage;
    set({ doc: { ...doc, pages } });
  },

  deleteSelectedElements: () => {
    const { doc, activePageIndex, selectedElementIds } = get();
    if (selectedElementIds.length === 0) return;
    get().pushHistory();
    const pages = [...doc.pages];
    const activePage = { ...pages[activePageIndex] };
    activePage.elements = activePage.elements.filter(
      (el) => !selectedElementIds.includes(el.id)
    );
    pages[activePageIndex] = activePage;
    set({ doc: { ...doc, pages }, selectedElementIds: [] });
  },

  duplicateSelectedElements: () => {
    const { doc, activePageIndex, selectedElementIds } = get();
    if (selectedElementIds.length === 0) return;
    get().pushHistory();
    const pages = [...doc.pages];
    const activePage = { ...pages[activePageIndex] };
    const newElements: StudioElement[] = [];
    const newSelectedIds: string[] = [];

    activePage.elements.forEach((el) => {
      if (selectedElementIds.includes(el.id)) {
        const clonedId = `el-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const cloned: StudioElement = {
          ...JSON.parse(JSON.stringify(el)),
          id: clonedId,
          x: el.x + 20,
          y: el.y + 20,
          name: `${el.name} (Copy)`,
        };
        newElements.push(cloned);
        newSelectedIds.push(clonedId);
      }
    });

    activePage.elements = [...activePage.elements, ...newElements];
    pages[activePageIndex] = activePage;
    set({ doc: { ...doc, pages }, selectedElementIds: newSelectedIds });
  },

  reorderElementZ: (id, direction) => {
    get().pushHistory();
    const { doc, activePageIndex } = get();
    const pages = [...doc.pages];
    const activePage = { ...pages[activePageIndex] };
    const elements = [...activePage.elements];
    const index = elements.findIndex((el) => el.id === id);
    if (index === -1) return;

    const [item] = elements.splice(index, 1);
    if (direction === "front") elements.push(item);
    else if (direction === "back") elements.unshift(item);
    else if (direction === "forward") elements.splice(Math.min(index + 1, elements.length), 0, item);
    else if (direction === "backward") elements.splice(Math.max(index - 1, 0), 0, item);

    activePage.elements = elements;
    pages[activePageIndex] = activePage;
    set({ doc: { ...doc, pages } });
  },

  alignSelectedElements: (direction) => {
    const { doc, activePageIndex, selectedElementIds } = get();
    if (selectedElementIds.length === 0) return;
    get().pushHistory();
    const pages = [...doc.pages];
    const activePage = { ...pages[activePageIndex] };
    const selected = activePage.elements.filter((el) => selectedElementIds.includes(el.id));
    if (selected.length === 0) return;

    // Single item aligns to artboard; multiple items align to bounding box
    const alignToArtboard = selected.length === 1;
    const minX = alignToArtboard ? 0 : Math.min(...selected.map((e) => e.x));
    const maxX = alignToArtboard ? activePage.width : Math.max(...selected.map((e) => e.x + e.width));
    const minY = alignToArtboard ? 0 : Math.min(...selected.map((e) => e.y));
    const maxY = alignToArtboard ? activePage.height : Math.max(...selected.map((e) => e.y + e.height));

    const updated = activePage.elements.map((el) => {
      if (!selectedElementIds.includes(el.id)) return el;
      let { x, y } = el;
      if (direction === "left") x = minX;
      else if (direction === "center") x = (minX + maxX) / 2 - el.width / 2;
      else if (direction === "right") x = maxX - el.width;
      else if (direction === "top") y = minY;
      else if (direction === "middle") y = (minY + maxY) / 2 - el.height / 2;
      else if (direction === "bottom") y = maxY - el.height;
      return { ...el, x, y };
    });

    activePage.elements = updated;
    pages[activePageIndex] = activePage;
    set({ doc: { ...doc, pages } });
  },

  addPage: (page) => {
    get().pushHistory();
    const { doc } = get();
    const newPage: StudioPage = page || {
      id: `page-${Date.now()}`,
      name: `Slide ${doc.pages.length + 1}`,
      width: doc.pages[0]?.width || 1920,
      height: doc.pages[0]?.height || 1080,
      background: "#FFFFFF",
      elements: [],
    };
    set({
      doc: { ...doc, pages: [...doc.pages, newPage] },
      activePageIndex: doc.pages.length,
      selectedElementIds: [],
    });
  },

  duplicatePage: (index) => {
    get().pushHistory();
    const { doc } = get();
    const target = doc.pages[index];
    if (!target) return;
    const clonedPage: StudioPage = {
      ...JSON.parse(JSON.stringify(target)),
      id: `page-${Date.now()}`,
      name: `${target.name} (Copy)`,
    };
    const nextPages = [...doc.pages];
    nextPages.splice(index + 1, 0, clonedPage);
    set({ doc: { ...doc, pages: nextPages }, activePageIndex: index + 1 });
  },

  deletePage: (index) => {
    const { doc, activePageIndex } = get();
    if (doc.pages.length <= 1) return; // Keep at least 1 page
    get().pushHistory();
    const nextPages = doc.pages.filter((_, i) => i !== index);
    const nextActive = Math.min(activePageIndex, nextPages.length - 1);
    set({ doc: { ...doc, pages: nextPages }, activePageIndex: nextActive, selectedElementIds: [] });
  },

  reorderPage: (fromIndex, toIndex) => {
    get().pushHistory();
    const { doc } = get();
    const nextPages = [...doc.pages];
    const [moved] = nextPages.splice(fromIndex, 1);
    nextPages.splice(toIndex, 0, moved);
    set({ doc: { ...doc, pages: nextPages }, activePageIndex: toIndex });
  },

  magicResize: (presetKey) => {
    const preset = ARTBOARD_PRESETS[presetKey];
    if (!preset) return;
    get().pushHistory();
    const { doc } = get();

    // Scale pages and elements proportionally
    const nextPages = doc.pages.map((page) => {
      const scaleX = preset.width / page.width;
      const scaleY = preset.height / page.height;

      const scaledElements = page.elements.map((el) => {
        const scaled: StudioElement = {
          ...el,
          x: Math.round(el.x * scaleX),
          y: Math.round(el.y * scaleY),
          width: Math.max(10, Math.round(el.width * scaleX)),
          height: Math.max(10, Math.round(el.height * scaleY)),
        };
        if (scaled.type === "text") {
          scaled.fontSize = Math.max(8, Math.round(scaled.fontSize * Math.min(scaleX, scaleY)));
        }
        return scaled;
      });

      return {
        ...page,
        width: preset.width,
        height: preset.height,
        elements: scaledElements,
      };
    });

    set({ doc: { ...doc, pages: nextPages } });
  },

  recolourToBrand: () => {
    get().pushHistory();
    const { doc } = get();
    const brandPalette = ["#5A4032", "#241915", "#DCD3F2", "#E6EEF4", "#C9CCD1"];

    const recolouredPages = doc.pages.map((page) => ({
      ...page,
      elements: page.elements.map((el) => {
        const copy = { ...el };
        if (copy.type === "text") {
          copy.color = "#241915";
        } else if (copy.type === "shape") {
          copy.fill = brandPalette[Math.floor(Math.random() * brandPalette.length)];
          if (copy.stroke) copy.stroke = "#C9CCD1";
        } else if (copy.type === "icon") {
          copy.color = "#5A4032";
        } else if (copy.type === "frame") {
          copy.borderColor = "#C9CCD1";
        }
        return copy;
      }),
    }));

    set({ doc: { ...doc, pages: recolouredPages } });
  },

  syncWithResumeData: (data) => {
    get().pushHistory();
    const { doc } = get();

    const syncedPages = doc.pages.map((page) => ({
      ...page,
      elements: page.elements.map((el) => {
        if (el.type !== "text" || !el.dataBinding) return el;
        let val: string | undefined;

        if (el.dataBinding === "contact.fullName") val = data.contact.fullName;
        else if (el.dataBinding === "contact.title") val = data.contact.title;
        else if (el.dataBinding === "contact.email") val = data.contact.email;
        else if (el.dataBinding === "contact.phone") val = data.contact.phone;
        else if (el.dataBinding === "summary") val = data.summary;
        else if (el.dataBinding.startsWith("experience[0].jobTitle") && data.experience[0]) {
          val = data.experience[0].jobTitle;
        } else if (el.dataBinding.startsWith("experience[0].company") && data.experience[0]) {
          val = data.experience[0].company;
        }

        if (val !== undefined && val.trim().length > 0) {
          return { ...el, content: val };
        }
        return el;
      }),
    }));

    set({ doc: { ...doc, pages: syncedPages } });
  },
}));
