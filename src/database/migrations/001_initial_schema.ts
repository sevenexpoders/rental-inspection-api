import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema001 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        // =====================================
        // EXTENSIONS
        // =====================================
        await queryRunner.query(`
            CREATE EXTENSION IF NOT EXISTS "pgcrypto";
        `);

        // =====================================
        // USERS
        // =====================================
        await queryRunner.query(`
            CREATE TABLE users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                phone VARCHAR(20),
                password_hash TEXT NOT NULL,
                status VARCHAR(20) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                deleted_at TIMESTAMP
            );
        `);

        await queryRunner.query(`CREATE INDEX idx_users_email ON users(email);`);

        // =====================================
        // ROLES
        // =====================================
        await queryRunner.query(`
            CREATE TABLE roles (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(50) UNIQUE NOT NULL

                description TEXT,
                status VARCHAR(20) DEFAULT 'active',
                order_index INTEGER DEFAULT 0,
                icon_name VARCHAR(100),
            );
        `);

        // =====================================
        // USER ROLES
        // =====================================
        await queryRunner.query(`
            CREATE TABLE user_roles (
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
                PRIMARY KEY (user_id, role_id)
            );
        `);

        // =====================================
        // REFRESH TOKENS
        // =====================================
        await queryRunner.query(`
            CREATE TABLE refresh_tokens (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                token TEXT NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                revoked BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        await queryRunner.query(`CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);`);

        // =====================================
        // PROPERTIES
        // =====================================
        await queryRunner.query(`
            CREATE TABLE properties (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                address TEXT NOT NULL,
                city VARCHAR(100),
                state VARCHAR(100),
                postal_code VARCHAR(20),
                country VARCHAR(100),
                created_by UUID REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                deleted_at TIMESTAMP
            );
        `);

        await queryRunner.query(`CREATE INDEX idx_properties_city ON properties(city);`);

        // =====================================
        // PROPERTY PARTIES
        // =====================================
        await queryRunner.query(`
            CREATE TABLE property_parties (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                role_type VARCHAR(20) NOT NULL,
                lease_id UUID,
                is_active BOOLEAN DEFAULT TRUE
            );
        `);

        // =====================================
        // LEASES
        // =====================================
        await queryRunner.query(`
            CREATE TABLE leases (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
                start_date DATE NOT NULL,
                end_date DATE,
                status VARCHAR(20) DEFAULT 'active'
            );
        `);

        // =====================================
        // INSPECTIONS
        // =====================================
        await queryRunner.query(`
            CREATE TABLE inspections (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
                lease_id UUID REFERENCES leases(id) ON DELETE SET NULL,
                inspection_date TIMESTAMP NOT NULL,
                agreement_start_date DATE,
                report_return_date DATE,
                status VARCHAR(30) DEFAULT 'draft',
                created_by UUID REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        await queryRunner.query(`CREATE INDEX idx_inspections_property ON inspections(property_id);`);

        // =====================================
        // SECTIONS
        // =====================================
        await queryRunner.query(`
            CREATE TABLE inspection_sections (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
                name VARCHAR(100) NOT NULL,
                order_index INT DEFAULT 0
            );
        `);

        await queryRunner.query(`CREATE INDEX idx_inspection_sections_inspection ON inspection_sections(inspection_id);`);

        // =====================================
        // ITEMS
        // =====================================
        await queryRunner.query(`
            CREATE TABLE inspection_items (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                section_id UUID REFERENCES inspection_sections(id) ON DELETE CASCADE,
                item_name VARCHAR(100) NOT NULL,
                is_clean BOOLEAN DEFAULT FALSE,
                is_undamaged BOOLEAN DEFAULT FALSE,
                is_working BOOLEAN DEFAULT FALSE,
                agent_comment TEXT,
                renter_comment TEXT
            );
        `);

        await queryRunner.query(`CREATE INDEX idx_inspection_items_section ON inspection_items(section_id);`);

        // =====================================
        // MEDIA
        // =====================================
        await queryRunner.query(`
            CREATE TABLE inspection_media (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
                section_id UUID,
                item_id UUID,
                file_url TEXT NOT NULL,
                media_type VARCHAR(20) DEFAULT 'photo',
                uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        await queryRunner.query(`CREATE INDEX idx_media_inspection ON inspection_media(inspection_id);`);

        // =====================================
        // SIGNATURES
        // =====================================
        await queryRunner.query(`
            CREATE TABLE signatures (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                signature_url TEXT NOT NULL,
                signed_at TIMESTAMP DEFAULT NOW(),
                ip_address VARCHAR(50)
            );
        `);

        // =====================================
        // AUDIT LOGS
        // =====================================
        await queryRunner.query(`
            CREATE TABLE audit_logs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE SET NULL,
                entity_type VARCHAR(100),
                entity_id UUID,
                action VARCHAR(50),
                old_value JSONB,
                new_value JSONB,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        await queryRunner.query(`CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);`);

        // =====================================
        // NOTIFICATIONS
        // =====================================
        await queryRunner.query(`
            CREATE TABLE notifications (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(200),
                message TEXT,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`DROP TABLE notifications`);
        await queryRunner.query(`DROP TABLE audit_logs`);
        await queryRunner.query(`DROP TABLE signatures`);
        await queryRunner.query(`DROP TABLE inspection_media`);
        await queryRunner.query(`DROP TABLE inspection_items`);
        await queryRunner.query(`DROP TABLE inspection_sections`);
        await queryRunner.query(`DROP TABLE inspections`);
        await queryRunner.query(`DROP TABLE leases`);
        await queryRunner.query(`DROP TABLE property_parties`);
        await queryRunner.query(`DROP TABLE properties`);
        await queryRunner.query(`DROP TABLE refresh_tokens`);
        await queryRunner.query(`DROP TABLE user_roles`);
        await queryRunner.query(`DROP TABLE roles`);
        await queryRunner.query(`DROP TABLE users`);
    }
}