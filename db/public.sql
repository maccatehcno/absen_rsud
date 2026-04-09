/*
 Navicat Premium Dump SQL

 Source Server         : Distritek New
 Source Server Type    : PostgreSQL
 Source Server Version : 170008 (170008)
 Source Host           : 148.230.102.103:5432
 Source Catalog        : cek
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 170008 (170008)
 File Encoding         : 65001

 Date: 09/04/2026 16:13:29
*/


-- ----------------------------
-- Type structure for AttendanceStatus
-- ----------------------------
DROP TYPE IF EXISTS "public"."AttendanceStatus";
CREATE TYPE "public"."AttendanceStatus" AS ENUM (
  'PRESENT',
  'LATE',
  'ABSENT',
  'PERMISSION'
);
ALTER TYPE "public"."AttendanceStatus" OWNER TO "usr_katalog";

-- ----------------------------
-- Type structure for LeaveStatus
-- ----------------------------
DROP TYPE IF EXISTS "public"."LeaveStatus";
CREATE TYPE "public"."LeaveStatus" AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED'
);
ALTER TYPE "public"."LeaveStatus" OWNER TO "usr_katalog";

-- ----------------------------
-- Type structure for Role
-- ----------------------------
DROP TYPE IF EXISTS "public"."Role";
CREATE TYPE "public"."Role" AS ENUM (
  'ADMIN',
  'STAFF'
);
ALTER TYPE "public"."Role" OWNER TO "usr_katalog";

-- ----------------------------
-- Table structure for Attendance
-- ----------------------------
DROP TABLE IF EXISTS "public"."Attendance";
CREATE TABLE "public"."Attendance" (
  "id" text COLLATE "pg_catalog"."default" NOT NULL,
  "userId" text COLLATE "pg_catalog"."default" NOT NULL,
  "checkIn" timestamp(3),
  "checkOut" timestamp(3),
  "checkInLatitude" float8,
  "checkInLongitude" float8,
  "checkOutLatitude" float8,
  "checkOutLongitude" float8,
  "photoPath" text COLLATE "pg_catalog"."default",
  "status" "public"."AttendanceStatus" NOT NULL DEFAULT 'PRESENT'::"AttendanceStatus",
  "note" text COLLATE "pg_catalog"."default",
  "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) NOT NULL
)
;
ALTER TABLE "public"."Attendance" OWNER TO "usr_katalog";

-- ----------------------------
-- Records of Attendance
-- ----------------------------
BEGIN;
INSERT INTO "public"."Attendance" ("id", "userId", "checkIn", "checkOut", "checkInLatitude", "checkInLongitude", "checkOutLatitude", "checkOutLongitude", "photoPath", "status", "note", "createdAt", "updatedAt") VALUES ('99c1b424-d2fe-4940-b1fc-dd7f915e7234', 'dc6bb4b5-fd47-4229-ac2b-d953604e6eac', '2026-04-09 07:20:54.228', NULL, -5.169891485019831, 119.45249742431032, NULL, NULL, 'uploads/attendance/checkin-1775719253633-523495408.jpg', 'PRESENT', NULL, '2026-04-09 07:20:54.24', '2026-04-09 07:20:54.24');
INSERT INTO "public"."Attendance" ("id", "userId", "checkIn", "checkOut", "checkInLatitude", "checkInLongitude", "checkOutLatitude", "checkOutLongitude", "photoPath", "status", "note", "createdAt", "updatedAt") VALUES ('8454a098-1a07-4d0d-b710-3b802a078a85', '60529c69-87bf-48ac-93e0-30d49800dd07', '2026-04-09 07:46:59.349', NULL, -5.169893049178067, 119.45241958745113, NULL, NULL, 'uploads/attendance/checkin-1775720818744-727223219.jpg', 'PRESENT', NULL, '2026-04-09 07:46:59.374', '2026-04-09 07:46:59.374');
COMMIT;

-- ----------------------------
-- Table structure for LeaveRequest
-- ----------------------------
DROP TABLE IF EXISTS "public"."LeaveRequest";
CREATE TABLE "public"."LeaveRequest" (
  "id" text COLLATE "pg_catalog"."default" NOT NULL,
  "userId" text COLLATE "pg_catalog"."default" NOT NULL,
  "startDate" timestamp(3) NOT NULL,
  "endDate" timestamp(3) NOT NULL,
  "reason" text COLLATE "pg_catalog"."default" NOT NULL,
  "status" "public"."LeaveStatus" NOT NULL DEFAULT 'PENDING'::"LeaveStatus",
  "attachment" text COLLATE "pg_catalog"."default",
  "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) NOT NULL
)
;
ALTER TABLE "public"."LeaveRequest" OWNER TO "usr_katalog";

-- ----------------------------
-- Records of LeaveRequest
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for Shift
-- ----------------------------
DROP TABLE IF EXISTS "public"."Shift";
CREATE TABLE "public"."Shift" (
  "id" text COLLATE "pg_catalog"."default" NOT NULL,
  "name" text COLLATE "pg_catalog"."default" NOT NULL,
  "startTime" text COLLATE "pg_catalog"."default" NOT NULL,
  "endTime" text COLLATE "pg_catalog"."default" NOT NULL,
  "gracePeriod" int4 NOT NULL DEFAULT 0,
  "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) NOT NULL
)
;
ALTER TABLE "public"."Shift" OWNER TO "usr_katalog";

-- ----------------------------
-- Records of Shift
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for User
-- ----------------------------
DROP TABLE IF EXISTS "public"."User";
CREATE TABLE "public"."User" (
  "id" text COLLATE "pg_catalog"."default" NOT NULL,
  "nip" text COLLATE "pg_catalog"."default" NOT NULL,
  "nik" text COLLATE "pg_catalog"."default" NOT NULL,
  "email" text COLLATE "pg_catalog"."default" NOT NULL,
  "name" text COLLATE "pg_catalog"."default" NOT NULL,
  "jabatan" text COLLATE "pg_catalog"."default" NOT NULL,
  "role" "public"."Role" NOT NULL DEFAULT 'STAFF'::"Role",
  "password" text COLLATE "pg_catalog"."default" NOT NULL,
  "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) NOT NULL
)
;
ALTER TABLE "public"."User" OWNER TO "usr_katalog";

-- ----------------------------
-- Records of User
-- ----------------------------
BEGIN;
INSERT INTO "public"."User" ("id", "nip", "nik", "email", "name", "jabatan", "role", "password", "createdAt", "updatedAt") VALUES ('8066637b-0058-44f5-8d9d-c1e559d1a380', 'admin_rsud', '1234567890', 'admin@rsudwajo.com', 'Administrator RSUD Wajo', 'IT Administrator', 'ADMIN', '$2b$10$Dc.pJOvFampwBeNgZ8O9ZOoHoQPYbJPpmW/h5RHVzPYgCKz99mJtC', '2026-04-09 06:54:32.376', '2026-04-09 06:54:32.376');
INSERT INTO "public"."User" ("id", "nip", "nik", "email", "name", "jabatan", "role", "password", "createdAt", "updatedAt") VALUES ('60529c69-87bf-48ac-93e0-30d49800dd07', '123456789', '123456789', 'asdar@gmail.com', 'Muhammad Asdar', 'Perawat', 'STAFF', '$2b$10$3FsnL6JWAe.2fRTgi1zAVOowdJrJTmB2l6OPEIbSG10wfPoOXDeFu', '2026-04-09 07:16:31.636', '2026-04-09 07:16:31.636');
INSERT INTO "public"."User" ("id", "nip", "nik", "email", "name", "jabatan", "role", "password", "createdAt", "updatedAt") VALUES ('dc6bb4b5-fd47-4229-ac2b-d953604e6eac', '19900101', '1234567890123456', 'budi@rsud.com', 'Budi Santoso', 'Perawat', 'STAFF', '$2b$10$CeiZYaC.mgXvrCGzkHc1We2IYCMvZ5pUG4a2l4C00aqIxrRKaS3k2', '2026-04-09 07:19:05.114', '2026-04-09 07:19:05.114');
COMMIT;

-- ----------------------------
-- Table structure for UserShift
-- ----------------------------
DROP TABLE IF EXISTS "public"."UserShift";
CREATE TABLE "public"."UserShift" (
  "id" text COLLATE "pg_catalog"."default" NOT NULL,
  "userId" text COLLATE "pg_catalog"."default" NOT NULL,
  "shiftId" text COLLATE "pg_catalog"."default" NOT NULL,
  "dayOfWeek" int4 NOT NULL,
  "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) NOT NULL
)
;
ALTER TABLE "public"."UserShift" OWNER TO "usr_katalog";

-- ----------------------------
-- Records of UserShift
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Primary Key structure for table Attendance
-- ----------------------------
ALTER TABLE "public"."Attendance" ADD CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table LeaveRequest
-- ----------------------------
ALTER TABLE "public"."LeaveRequest" ADD CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table Shift
-- ----------------------------
CREATE UNIQUE INDEX "Shift_name_key" ON "public"."Shift" USING btree (
  "name" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table Shift
-- ----------------------------
ALTER TABLE "public"."Shift" ADD CONSTRAINT "Shift_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table User
-- ----------------------------
CREATE UNIQUE INDEX "User_email_key" ON "public"."User" USING btree (
  "email" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "User_nik_key" ON "public"."User" USING btree (
  "nik" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "User_nip_key" ON "public"."User" USING btree (
  "nip" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table User
-- ----------------------------
ALTER TABLE "public"."User" ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table UserShift
-- ----------------------------
CREATE UNIQUE INDEX "UserShift_userId_dayOfWeek_key" ON "public"."UserShift" USING btree (
  "userId" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "dayOfWeek" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table UserShift
-- ----------------------------
ALTER TABLE "public"."UserShift" ADD CONSTRAINT "UserShift_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Foreign Keys structure for table Attendance
-- ----------------------------
ALTER TABLE "public"."Attendance" ADD CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table LeaveRequest
-- ----------------------------
ALTER TABLE "public"."LeaveRequest" ADD CONSTRAINT "LeaveRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table UserShift
-- ----------------------------
ALTER TABLE "public"."UserShift" ADD CONSTRAINT "UserShift_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "public"."Shift" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."UserShift" ADD CONSTRAINT "UserShift_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
