-- CreateTable
CREATE TABLE "user" (
    "user_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_enabled" BOOLEAN NOT NULL DEFAULT true,
    "image" TEXT,
    "uuid" TEXT,
    "external_id" TEXT,
    "department" TEXT,
    "job_title" TEXT,
    "supervisor_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_managed" BOOLEAN NOT NULL DEFAULT true,
    "timezone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "user_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "user_session" (
    "user_session_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "impersonated_role" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "user_session_pkey" PRIMARY KEY ("user_session_id")
);

-- CreateTable
CREATE TABLE "user_account" (
    "user_account_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "access_token_expires_at" TIMESTAMP(3),
    "refresh_token_expires_at" TIMESTAMP(3),
    "scope" TEXT,
    "id_token" TEXT,
    "password" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "user_account_pkey" PRIMARY KEY ("user_account_id")
);

-- CreateTable
CREATE TABLE "user_verification" (
    "user_verification_id" SERIAL NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "user_verification_pkey" PRIMARY KEY ("user_verification_id")
);

-- CreateTable
CREATE TABLE "sso_provider" (
    "sso_provider_id" SERIAL NOT NULL,
    "issuer" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "oidc_config" TEXT,
    "saml_config" TEXT,
    "user_id" INTEGER,
    "provider_id" TEXT NOT NULL,
    "organization_id" TEXT,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sso_provider_pkey" PRIMARY KEY ("sso_provider_id")
);

-- CreateTable
CREATE TABLE "user_role" (
    "user_role_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,

    CONSTRAINT "user_role_pkey" PRIMARY KEY ("user_role_id")
);

-- CreateTable
CREATE TABLE "role" (
    "role_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "resource_action" (
    "resource_action_id" SERIAL NOT NULL,
    "resource_id" INTEGER NOT NULL,
    "action_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,

    CONSTRAINT "resource_action_pkey" PRIMARY KEY ("resource_action_id")
);

-- CreateTable
CREATE TABLE "role_resource_action" (
    "role_resource_action_id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "resource_action_id" INTEGER NOT NULL,
    "permit" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,

    CONSTRAINT "role_resource_action_pkey" PRIMARY KEY ("role_resource_action_id")
);

-- CreateTable
CREATE TABLE "resource" (
    "resource_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,

    CONSTRAINT "resource_pkey" PRIMARY KEY ("resource_id")
);

-- CreateTable
CREATE TABLE "action" (
    "action_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,

    CONSTRAINT "action_pkey" PRIMARY KEY ("action_id")
);

-- CreateTable
CREATE TABLE "configuration" (
    "configuration_id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,

    CONSTRAINT "configuration_pkey" PRIMARY KEY ("configuration_id")
);

-- CreateTable
CREATE TABLE "system_process" (
    "system_process_id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "pid" INTEGER NOT NULL,
    "parameter" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,

    CONSTRAINT "system_process_pkey" PRIMARY KEY ("system_process_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_session_token_key" ON "user_session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "user_role_user_id_role_id_key" ON "user_role"("user_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "resource_action_resource_id_action_id_key" ON "resource_action"("resource_id", "action_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_resource_action_role_id_resource_action_id_key" ON "role_resource_action"("role_id", "resource_action_id");

-- CreateIndex
CREATE UNIQUE INDEX "configuration_key_key" ON "configuration"("key");

-- CreateIndex
CREATE UNIQUE INDEX "system_process_key_key" ON "system_process"("key");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_session" ADD CONSTRAINT "user_session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_session" ADD CONSTRAINT "user_session_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_session" ADD CONSTRAINT "user_session_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_account" ADD CONSTRAINT "user_account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_account" ADD CONSTRAINT "user_account_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_account" ADD CONSTRAINT "user_account_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_verification" ADD CONSTRAINT "user_verification_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_verification" ADD CONSTRAINT "user_verification_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sso_provider" ADD CONSTRAINT "sso_provider_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sso_provider" ADD CONSTRAINT "sso_provider_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sso_provider" ADD CONSTRAINT "sso_provider_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "resource_action" ADD CONSTRAINT "resource_action_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resource"("resource_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_action" ADD CONSTRAINT "resource_action_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "action"("action_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_action" ADD CONSTRAINT "resource_action_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "resource_action" ADD CONSTRAINT "resource_action_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "role_resource_action" ADD CONSTRAINT "role_resource_action_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_resource_action" ADD CONSTRAINT "role_resource_action_resource_action_id_fkey" FOREIGN KEY ("resource_action_id") REFERENCES "resource_action"("resource_action_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_resource_action" ADD CONSTRAINT "role_resource_action_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "role_resource_action" ADD CONSTRAINT "role_resource_action_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "resource" ADD CONSTRAINT "resource_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "resource" ADD CONSTRAINT "resource_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "action" ADD CONSTRAINT "action_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "action" ADD CONSTRAINT "action_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "configuration" ADD CONSTRAINT "configuration_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "configuration" ADD CONSTRAINT "configuration_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "system_process" ADD CONSTRAINT "system_process_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "system_process" ADD CONSTRAINT "system_process_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
