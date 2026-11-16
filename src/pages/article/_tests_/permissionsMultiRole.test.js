//SCRUM-140, usuario con varios roles
import { describe, it, expect } from "vitest";
import { isAdmin, isMember, isAuthor, isCommittee } from "../utils/permissions";

describe("permisos con varios roles", () => {
    it("reconoce cada rol dentro del arreglo roles", () => {
        const u = { id: 1, roles: ["AUTHOR", "MEMBER"] };
        expect(isAuthor(u)).toBe(true);
        expect(isMember(u)).toBe(true);
        expect(isAdmin(u)).toBe(false);
        expect(isCommittee(u)).toBe(true);
    });

    it("ADMIN junto a otro rol sigue siendo admin", () => {
        expect(isAdmin({ id: 1, roles: ["MEMBER", "ADMIN"] })).toBe(true);
    });

    it("sin roles o arreglo vacío no es nada", () => {
        expect(isAdmin({ id: 1, roles: [] })).toBe(false);
        expect(isAuthor({ id: 1, roles: [] })).toBe(false);
        expect(isAdmin(null)).toBe(false);
    });

    it("mantiene el fallback del contrato viejo (role único)", () => {
        expect(isAuthor({ id: 1, role: "AUTHOR" })).toBe(true);
        expect(isMember({ id: 1, role: "MEMBER" })).toBe(true);
    });
});