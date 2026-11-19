import { describe, expect, it } from "vitest";
import { formatVersionLabel, normalizeAttachment, toAbsoluteUrl, validateVersionFile } from "../utils/versionFiles";

const file = (name, size = 1024) => ({ name, size });

describe("validación de archivos de versiones (SCRUM-33 / SCRUM-31)", () => {
    it("acepta un PDF dentro del límite", () => {
        expect(validateVersionFile(file("articulo.PDF"), "pdf")).toBeNull();
    });

    it("rechaza versión corregida/final que no sea PDF", () => {
        expect(validateVersionFile(file("foto.png"), "pdf", "PDF final")).toMatch(/debe ser un PDF/);
    });

    it("el copyright admite PDF, JPG, JPEG y PNG como el backend", () => {
        ["a.pdf", "a.jpg", "a.jpeg", "a.png"].forEach((n) =>
            expect(validateVersionFile(file(n), "copyright")).toBeNull()
        );
        expect(validateVersionFile(file("a.docx"), "copyright")).toMatch(/PDF o una imagen/);
    });

    it("rechaza archivos de más de 10 MB y archivos vacíos", () => {
        expect(validateVersionFile(file("a.pdf", 10 * 1024 * 1024 + 1), "pdf")).toMatch(/10 MB/);
        expect(validateVersionFile(file("a.pdf", 10 * 1024 * 1024), "pdf")).toBeNull();
        expect(validateVersionFile(file("a.pdf", 0), "pdf")).toMatch(/vacío/);
    });

    it("sin archivo devuelve un mensaje", () => {
        expect(validateVersionFile(null, "pdf")).toBeTruthy();
    });
});

describe("normalización del historial (GET corrected-version)", () => {
    const raw = {
        article_attached_id: 7,
        article_attached_url: "/media/final_versions/abc%20123.pdf",
        article_attached_version: "Final",
        article_attached_created_at: "2026-11-17T10:30:00-05:00"
    };

    it("completa URLs relativas con la URL del backend", () => {
        expect(toAbsoluteUrl("/media/x.pdf", "http://localhost:8000/")).toBe("http://localhost:8000/media/x.pdf");
        expect(toAbsoluteUrl("https://supabase.co/x.pdf", "http://localhost:8000")).toBe("https://supabase.co/x.pdf");
    });

    it("arma la fila del historial", () => {
        expect(normalizeAttachment(raw, "http://localhost:8000")).toEqual({
            id: 7,
            version: "Final",
            date: "2026-11-17",
            url: "http://localhost:8000/media/final_versions/abc%20123.pdf",
            name: "abc 123.pdf"
        });
    });

    it("etiqueta versiones numéricas con v y devuelve null sin adjunto", () => {
        expect(formatVersionLabel("2.0")).toBe("v2.0");
        expect(formatVersionLabel("Final")).toBe("Final");
        expect(normalizeAttachment(null)).toBeNull();
    });
});