"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CandidatesRepository = void 0;
const database_1 = require("../../config/database");
class CandidatesRepository {
    async getAll() {
        return database_1.prisma.candidate.findMany({
            orderBy: { number: 'asc' },
        });
    }
    async getById(id) {
        return database_1.prisma.candidate.findUnique({
            where: { id },
        });
    }
    async getByNumber(number) {
        return database_1.prisma.candidate.findUnique({
            where: { number },
        });
    }
    async create(data) {
        return database_1.prisma.candidate.create({
            data,
        });
    }
    async update(id, data) {
        return database_1.prisma.candidate.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return database_1.prisma.candidate.delete({
            where: { id },
        });
    }
}
exports.CandidatesRepository = CandidatesRepository;
