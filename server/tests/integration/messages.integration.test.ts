import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { resetDB } from "../../prisma/resetDB";
import { createPrismaClient, ExtendedPrismaClient } from "../../prisma/prismaClient";
import { createApp } from "../../src/app";
import type { Express } from "express";
import { ExtendedUserClient } from "../../types/extendedClients";
import request from "supertest";