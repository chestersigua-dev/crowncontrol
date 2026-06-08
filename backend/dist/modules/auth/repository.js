"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const database_1 = require("../../config/database");
class AuthRepository {
    async findByUsername(username) {
        return database_1.prisma.user.findUnique({
            where: { username },
        });
    }
    async findById(id) {
        return database_1.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                name: true,
                role: true,
                isChairman: true,
                createdAt: true,
            },
        });
    }
    async createUser(data) {
        return database_1.prisma.$transaction(async (tx) => {
            if (data.isChairman) {
                await tx.user.updateMany({
                    where: { isChairman: true },
                    data: { isChairman: false },
                });
            }
            return tx.user.create({
                data: {
                    username: data.username,
                    password: data.password || '',
                    name: data.name,
                    role: data.role || 'JUDGE',
                    isChairman: data.isChairman || false,
                },
            });
        });
    }
    async getAllJudges() {
        return database_1.prisma.user.findMany({
            where: { role: 'JUDGE' },
            select: {
                id: true,
                username: true,
                name: true,
                role: true,
                isChairman: true,
            },
        });
    }
    async getAllAdmins() {
        return database_1.prisma.user.findMany({
            where: {
                role: {
                    in: ['ADMIN', 'SUPERADMIN']
                }
            },
            select: {
                id: true,
                username: true,
                name: true,
                role: true,
                createdAt: true
            },
            orderBy: { name: 'asc' }
        });
    }
    async updateAdmin(id, data) {
        const updateData = {};
        if (data.role)
            updateData.role = data.role;
        if (data.name)
            updateData.name = data.name;
        return database_1.prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                username: true,
                name: true,
                role: true
            }
        });
    }
    async deleteAdmin(id) {
        return database_1.prisma.user.delete({
            where: { id }
        });
    }
}
exports.AuthRepository = AuthRepository;
