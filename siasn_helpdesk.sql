--
-- PostgreSQL database dump
--

-- Dumped from database version 13.7
-- Dumped by pg_dump version 13.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activities (
    id integer NOT NULL,
    name character varying(255),
    description character varying(255),
    type character varying(255),
    sender character varying(255),
    receiver character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ticket_id uuid
);


ALTER TABLE public.activities OWNER TO postgres;

--
-- Name: activities_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.activities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.activities_id_seq OWNER TO postgres;

--
-- Name: activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.activities_id_seq OWNED BY public.activities.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    color character varying(255) NOT NULL,
    kode_satuan_kerja character varying(255),
    satuan_kerja jsonb,
    description text,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by character varying(255),
    updated_by character varying(255)
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER TABLE public.categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    message text,
    user_custom_id character varying(255),
    comment_id integer,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp(6) with time zone
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.comments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER TABLE public.comments_id_seq OWNER TO postgres;

--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- Name: comments_reactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments_reactions (
    comment_id integer NOT NULL,
    user_id character varying(255) NOT NULL,
    reaction character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.comments_reactions OWNER TO postgres;

--
-- Name: faqs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.faqs (
    id integer NOT NULL,
    name text,
    description text,
    user_id character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.faqs OWNER TO postgres;

--
-- Name: faqs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.faqs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.faqs_id_seq OWNER TO postgres;

--
-- Name: faqs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.faqs_id_seq OWNED BY public.faqs.id;


--
-- Name: knex_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.knex_migrations (
    id integer NOT NULL,
    name character varying(255),
    batch integer,
    migration_time timestamp(6) with time zone
);


ALTER TABLE public.knex_migrations OWNER TO postgres;

--
-- Name: knex_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.knex_migrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER TABLE public.knex_migrations_id_seq OWNER TO postgres;

--
-- Name: knex_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.knex_migrations_id_seq OWNED BY public.knex_migrations.id;


--
-- Name: knex_migrations_lock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.knex_migrations_lock (
    index integer NOT NULL,
    is_locked integer
);


ALTER TABLE public.knex_migrations_lock OWNER TO postgres;

--
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.knex_migrations_lock_index_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER TABLE public.knex_migrations_lock_index_seq OWNER TO postgres;

--
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.knex_migrations_lock_index_seq OWNED BY public.knex_migrations_lock.index;


--
-- Name: mentions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mentions (
    id integer NOT NULL,
    user_id character varying(255),
    mention_by character varying(255),
    ticket_id uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.mentions OWNER TO postgres;

--
-- Name: mentions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mentions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.mentions_id_seq OWNER TO postgres;

--
-- Name: mentions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mentions_id_seq OWNED BY public.mentions.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    type character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    content character varying(255) NOT NULL,
    "from" character varying(255) NOT NULL,
    "to" character varying(255),
    read_at timestamp(6) with time zone,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    type_id uuid,
    role character varying(255),
    ticket_id uuid
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER TABLE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id integer NOT NULL,
    action character varying(255) NOT NULL,
    subject character varying(255) NOT NULL,
    conditions json,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER TABLE public.permissions_id_seq OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: priorities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.priorities (
    name character varying(255) NOT NULL,
    color character varying(255) NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by character varying(255)
);


ALTER TABLE public.priorities OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    name character varying(255) NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: saved_replies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.saved_replies (
    id integer NOT NULL,
    name text,
    content text,
    user_id character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.saved_replies OWNER TO postgres;

--
-- Name: saved_replies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.saved_replies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.saved_replies_id_seq OWNER TO postgres;

--
-- Name: saved_replies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.saved_replies_id_seq OWNED BY public.saved_replies.id;


--
-- Name: status; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.status (
    name character varying(100) NOT NULL,
    created_at timestamp(6) without time zone DEFAULT now(),
    updated_at timestamp(6) without time zone DEFAULT now(),
    created_by character varying(255)
);


ALTER TABLE public.status OWNER TO postgres;

--
-- Name: sub_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sub_categories (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    category_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    user_id character varying(255),
    description text
);


ALTER TABLE public.sub_categories OWNER TO postgres;

--
-- Name: sub_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sub_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sub_categories_id_seq OWNER TO postgres;

--
-- Name: sub_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sub_categories_id_seq OWNED BY public.sub_categories.id;


--
-- Name: sub_faqs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sub_faqs (
    id integer NOT NULL,
    question text,
    answer text,
    user_id character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    faq_id integer
);


ALTER TABLE public.sub_faqs OWNER TO postgres;

--
-- Name: sub_faqs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sub_faqs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sub_faqs_id_seq OWNER TO postgres;

--
-- Name: sub_faqs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sub_faqs_id_seq OWNED BY public.sub_faqs.id;


--
-- Name: tickets_histories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tickets_histories (
    id integer NOT NULL,
    user_id character varying(255),
    ticket_id uuid,
    status character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    comment text DEFAULT ''::text NOT NULL
);


ALTER TABLE public.tickets_histories OWNER TO postgres;

--
-- Name: ticket_status_histories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ticket_status_histories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ticket_status_histories_id_seq OWNER TO postgres;

--
-- Name: ticket_status_histories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ticket_status_histories_id_seq OWNED BY public.tickets_histories.id;


--
-- Name: tickets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tickets (
    id uuid NOT NULL,
    title character varying(255),
    description character varying(255),
    content text,
    html text,
    ticket_number text,
    assignee character varying(255),
    requester character varying(255),
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    start_work_at timestamp(6) with time zone,
    completed_at timestamp(6) with time zone,
    assignee_json jsonb,
    requester_json jsonb,
    file_url character varying(255),
    finished_at timestamp(6) without time zone,
    chooser character varying(255),
    chooser_picked_at timestamp(6) without time zone,
    status_code character varying(255),
    category_id integer,
    priority_code character varying(255),
    assignee_reason text,
    stars integer,
    requester_comment character varying(255),
    has_feedback boolean DEFAULT false,
    sub_category_id integer,
    skip_feedback boolean DEFAULT false,
    is_published boolean DEFAULT false,
    is_pinned boolean DEFAULT false,
    is_locked boolean DEFAULT false,
    is_edited boolean DEFAULT false
);


ALTER TABLE public.tickets OWNER TO postgres;

--
-- Name: tickets_agents_helper; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tickets_agents_helper (
    user_custom_id character varying(255) NOT NULL,
    ticket_id uuid NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    role_id character varying(200)
);


ALTER TABLE public.tickets_agents_helper OWNER TO postgres;

--
-- Name: tickets_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tickets_attachments (
    id uuid NOT NULL,
    ticket_id uuid,
    file_name character varying(255),
    file_path character varying(255),
    file_type character varying(255),
    file_size character varying(255),
    file_url character varying(255),
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.tickets_attachments OWNER TO postgres;

--
-- Name: tickets_comments_agents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tickets_comments_agents (
    id uuid NOT NULL,
    ticket_id uuid,
    user_id character varying(255),
    comment text,
    html text,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    role character varying(255)
);


ALTER TABLE public.tickets_comments_agents OWNER TO postgres;

--
-- Name: tickets_comments_customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tickets_comments_customers (
    id integer NOT NULL,
    ticket_id uuid,
    comment text,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    role character varying(255),
    user_id character varying(255),
    is_answer boolean DEFAULT false,
    is_edited boolean DEFAULT false
);


ALTER TABLE public.tickets_comments_customers OWNER TO postgres;

--
-- Name: tickets_comments_customers_agents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tickets_comments_customers_agents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER TABLE public.tickets_comments_customers_agents_id_seq OWNER TO postgres;

--
-- Name: tickets_comments_customers_agents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tickets_comments_customers_agents_id_seq OWNED BY public.tickets_comments_customers.id;


--
-- Name: tickets_labels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tickets_labels (
    ticket_id uuid NOT NULL,
    label character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.tickets_labels OWNER TO postgres;

--
-- Name: tickets_reactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tickets_reactions (
    id integer NOT NULL,
    user_id character varying(255),
    ticket_id uuid,
    reaction character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.tickets_reactions OWNER TO postgres;

--
-- Name: tickets_subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tickets_subscriptions (
    user_id character varying(255) NOT NULL,
    ticket_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tickets_subscriptions OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    custom_id character varying(255) NOT NULL,
    username character varying(255),
    image character varying(255),
    id character varying(255),
    "from" character varying(255),
    role character varying(255),
    "group" character varying(255),
    employee_number character varying(255),
    birthdate date,
    last_login timestamp(6) with time zone,
    email character varying(255),
    organization_id character varying(255),
    "current_role" character varying(255) DEFAULT 'user'::character varying,
    is_online boolean DEFAULT false
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users_permissions (
    id integer NOT NULL,
    role_id character varying(255) NOT NULL,
    permission_id integer NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.users_permissions OWNER TO postgres;

--
-- Name: users_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER TABLE public.users_permissions_id_seq OWNER TO postgres;

--
-- Name: users_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_permissions_id_seq OWNED BY public.users_permissions.id;


--
-- Name: users_reactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_reactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_reactions_id_seq OWNER TO postgres;

--
-- Name: users_reactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_reactions_id_seq OWNED BY public.tickets_reactions.id;


--
-- Name: activities id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities ALTER COLUMN id SET DEFAULT nextval('public.activities_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: faqs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faqs ALTER COLUMN id SET DEFAULT nextval('public.faqs_id_seq'::regclass);


--
-- Name: knex_migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knex_migrations ALTER COLUMN id SET DEFAULT nextval('public.knex_migrations_id_seq'::regclass);


--
-- Name: knex_migrations_lock index; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knex_migrations_lock ALTER COLUMN index SET DEFAULT nextval('public.knex_migrations_lock_index_seq'::regclass);


--
-- Name: mentions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mentions ALTER COLUMN id SET DEFAULT nextval('public.mentions_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: saved_replies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_replies ALTER COLUMN id SET DEFAULT nextval('public.saved_replies_id_seq'::regclass);


--
-- Name: sub_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_categories ALTER COLUMN id SET DEFAULT nextval('public.sub_categories_id_seq'::regclass);


--
-- Name: sub_faqs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_faqs ALTER COLUMN id SET DEFAULT nextval('public.sub_faqs_id_seq'::regclass);


--
-- Name: tickets_comments_customers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets_comments_customers ALTER COLUMN id SET DEFAULT nextval('public.tickets_comments_customers_agents_id_seq'::regclass);


--
-- Name: tickets_histories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets_histories ALTER COLUMN id SET DEFAULT nextval('public.ticket_status_histories_id_seq'::regclass);


--
-- Name: tickets_reactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets_reactions ALTER COLUMN id SET DEFAULT nextval('public.users_reactions_id_seq'::regclass);


--
-- Name: users_permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_permissions ALTER COLUMN id SET DEFAULT nextval('public.users_permissions_id_seq'::regclass);


--
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activities (id, name, description, type, sender, receiver, created_at, updated_at, ticket_id) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, color, kode_satuan_kerja, satuan_kerja, description, created_at, updated_at, created_by, updated_by) FROM stdin;
9	Pembetulan Nama SAPK	#9f36ce	123	{"label": "BADAN KEPEGAWAIAN DAERAH", "value": "123"}	Pembetulan nama nama salah	2022-10-18 08:44:22.031856+07	2022-10-18 08:44:22.031856+07	master|56543	\N
15	CPNS ke PNS	#a2db86	12302	{"label": "BIDANG PERENCANAAN, PENGADAAN, PENGOLAHAN DATA DAN SISTEM INFORMASI", "value": "12302"}	Proses usul pengangkatan CPNS ke PNS	2023-02-23 08:23:31.411244+07	2023-02-23 08:40:10.528+07	master|40	master|40
16	Peninjauan Masa Kerja - PMK	#e8889c	12304	{"label": "BIDANG MUTASI", "value": "12304"}	Proses Pengakuan masa kerja dengan panambahan masa kerja sebelum diangkat menjadi CPNS	2023-02-23 08:24:22.641291+07	2023-02-23 08:40:57.348+07	master|40	master|40
17	Mutasi antar Daerah	#2378ee	12304	{"label": "BIDANG MUTASI", "value": "12304"}	Proses pengajuan mutasi antar Pemkab, Pemprov dan lainnya.	2023-02-23 08:25:44.015756+07	2023-02-23 08:41:39.811+07	master|40	master|40
14	Pelayanan peremajaan Data ASN	#5331da	12302	{"label": "BIDANG PERENCANAAN, PENGADAAN, PENGOLAHAN DATA DAN SISTEM INFORMASI", "value": "12302"}	Proses peremajaan data melalui SI-ASN	2023-02-18 15:03:29.106899+07	2023-02-23 08:42:01.741+07	master|40	master|40
23	MPP	#871c9f	12303	{"label": "BIDANG PEMBINAAN, KESEJAHTERAAN DAN PERLINDUNGAN HUKUM APARATUR SIPIL NEGARA", "value": "12303"}	Aturan terkait masa persiapan pensiun	2023-03-07 08:45:03.478226+07	2023-03-07 08:45:36.291+07	master|58521	master|58521
22	Satyalancana Karya Satya	#20a486	12303	{"label": "BIDANG PEMBINAAN, KESEJAHTERAAN DAN PERLINDUNGAN HUKUM APARATUR SIPIL NEGARA", "value": "12303"}	Proses pengusulan Satyalancana Karya Satya	2023-03-07 08:44:16.107716+07	2023-03-07 08:45:53.345+07	master|58521	master|58521
21	Cuti	#5fb698	12303	{"label": "BIDANG PEMBINAAN, KESEJAHTERAAN DAN PERLINDUNGAN HUKUM APARATUR SIPIL NEGARA", "value": "12303"}	Aturan tentang Cuti	2023-03-07 08:43:33.278472+07	2023-03-07 08:46:01.688+07	master|58521	master|58521
20	SKP	#52a511	12303	{"label": "BIDANG PEMBINAAN, KESEJAHTERAAN DAN PERLINDUNGAN HUKUM APARATUR SIPIL NEGARA", "value": "12303"}	Proses pengerjaan SKP	2023-03-07 08:43:09.90614+07	2023-03-07 08:46:08.129+07	master|58521	master|58521
19	Cuti	#a743b5	12303	{"label": "BIDANG PEMBINAAN, KESEJAHTERAAN DAN PERLINDUNGAN HUKUM APARATUR SIPIL NEGARA", "value": "12303"}	Proses Cuti	2023-03-07 08:42:52.994606+07	2023-03-07 08:46:26.142+07	master|58521	master|58521
18	P3K	#650fa6	12302	{"label": "BIDANG PERENCANAAN, PENGADAAN, PENGOLAHAN DATA DAN SISTEM INFORMASI", "value": "12302"}	Seputar P3K 	2023-03-02 10:53:57.337468+07	2023-03-07 15:59:03.189+07	master|95	master|56543
12	Aplikasi E-Presensi	#6e22fb	12303	{"label": "BIDANG PEMBINAAN, KESEJAHTERAAN DAN PERLINDUNGAN HUKUM APARATUR SIPIL NEGARA", "value": "12303"}	Presensi Online BKD Provinsi Jawa Timur	2022-11-12 14:11:17.939829+07	2023-03-07 15:59:30.635+07	master|56543	master|56543
11	MySAPK	#6a260b	12302	{"label": "BIDANG PERENCANAAN, PENGADAAN, PENGOLAHAN DATA DAN SISTEM INFORMASI", "value": "12302"}	Aplikasi BKN 	2022-11-04 14:33:39.032966+07	2023-03-07 15:59:46.65+07	master|56543	master|56543
24	Seleksi CASN	#28df73	12302	{"label": "BIDANG PERENCANAAN, PENGADAAN, PENGOLAHAN DATA DAN SISTEM INFORMASI", "value": "12302"}	Seputar CASN	2023-03-09 04:17:42.145908+07	2023-03-09 04:17:42.145908+07	master|56543	\N
25	SIASN	#aea0a8	12302	{"label": "BIDANG PERENCANAAN, PENGADAAN, PENGOLAHAN DATA DAN SISTEM INFORMASI", "value": "12302"}	Sistem Informasi Aparatur Sipili Negara BKN	2023-03-09 04:22:57.870896+07	2023-03-09 04:22:57.870896+07	master|56543	\N
26	Seleksi dan Pengadaan	#5ec40f	12302	{"label": "BIDANG PERENCANAAN, PENGADAAN, PENGOLAHAN DATA DAN SISTEM INFORMASI", "value": "12302"}	Seleksi dan Pengadaan	2023-03-15 09:32:48.226809+07	2023-03-15 09:32:48.226809+07	master|56543	\N
27	Pertanyaan Umum	#a5ba26	123	{"label": "BADAN KEPEGAWAIAN DAERAH", "value": "123"}	Layanan Umum	2023-03-18 06:52:48.974835+07	2023-03-18 07:03:27.101+07	master|40	master|40
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (id, message, user_custom_id, comment_id, created_at, updated_at, deleted_at) FROM stdin;
2	test	master|56543	\N	2022-10-18 08:42:02.703806+07	2022-10-18 08:42:02.703806+07	\N
3	test	master|56543	\N	2022-10-19 08:36:39.984264+07	2022-10-19 08:36:39.984264+07	\N
4	hello world	master|56543	\N	2022-10-19 08:38:25.465164+07	2022-10-19 08:38:25.465164+07	\N
5	test	master|56543	4	2022-10-19 08:38:37.683951+07	2022-10-19 08:38:37.683951+07	\N
6	wkkwkw koplak	master|56543	4	2022-10-19 08:39:21.447333+07	2022-10-19 08:39:21.447333+07	\N
7	test\nkwkw	master|56543	4	2022-10-19 08:41:15.694454+07	2022-10-19 08:41:15.694454+07	\N
8	ndas mu	master|56543	4	2022-10-19 08:42:07.537355+07	2022-10-19 08:42:07.537355+07	\N
9	test	master|56543	\N	2022-10-25 12:49:37.497153+07	2022-10-25 12:49:37.497153+07	\N
\.


--
-- Data for Name: comments_reactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments_reactions (comment_id, user_id, reaction, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: faqs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.faqs (id, name, description, user_id, created_at, updated_at) FROM stdin;
21	Pemutakhiran Data Mandiri	PDM dari BKN Pusat	master|56543	2022-11-12 18:55:57.549483+07	2022-11-12 18:55:57.549483+07
22	Pengusulan Cuti	Pengambilan cuti sebelum atau sesudah cuti bersama / hari libur nasional	master|58521	2023-03-07 08:48:57.524863+07	2023-03-07 08:48:57.524863+07
23	Satyalancana Karya Satya	Proses pengusulan Satyalancana Karya Satya bagi PNS Provinsi Jawa Timur	master|58521	2023-03-07 09:17:35.073812+07	2023-03-07 09:17:35.073812+07
24	Mutasi Masuk	Perpindahan ASN dari Luar Pemprov Jatim masuk ke Pemprov Jatim	master|40	2023-03-08 14:36:54.139218+07	2023-03-08 14:36:54.139218+07
\.


--
-- Data for Name: knex_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.knex_migrations (id, name, batch, migration_time) FROM stdin;
23	20221018203716_rename column comment to message in table comments.js	1	2022-10-19 08:34:05.944+07
24	20221025092050_create assignee reason in tickets.js	2	2022-10-25 16:21:36.349+07
25	20221026020344_create typeId for notifications.js	3	2022-10-26 09:04:32.296+07
26	20221026020839_create role in tickets agents helper.js	4	2022-10-26 09:09:33.795+07
27	20221026055331_create role to comments customers to agents.js	5	2022-10-26 12:54:34.035+07
28	20221026055542_add column role to tickets comments agents.js	6	2022-10-26 12:57:03.201+07
29	20221026063204_add column stars and requester_comment.js	7	2022-10-26 13:34:23.066+07
30	20221026071546_create column has feedback in tickets table.js	8	2022-10-26 14:17:51.116+07
31	20221027012619_add column role to notifications.js	9	2022-10-27 08:26:57.009+07
32	20221031035953_add sub category.js	10	2022-10-31 11:03:10.45+07
33	20221031073101_add column deskripsi di sub kategori.js	11	2022-10-31 14:31:37.505+07
34	20221102084236_create table faqs.js	12	2022-11-02 15:44:20.602+07
35	20221102084427_create table sub_faqs.js	13	2022-11-02 15:45:24.733+07
36	20221103065020_add user_id to chats agents to customers.js	14	2022-11-03 13:54:25.325+07
37	20221103094010_add sub_category_id to ticket.js	15	2022-11-03 16:50:24.858+07
38	20221103135844_add column to tickets.js	16	2022-11-04 06:58:00.327+07
39	20221104034035_create faq_id in sub_faqs tables.js	17	2022-11-04 10:41:55.235+07
40	20221111091938_create offline and online.js	18	2022-11-11 16:24:49.867+07
41	20221112104356_change data type from varchar to text.js	19	2022-11-12 17:48:08.892+07
42	20230309130722_add column skip feedback to tickets.js	20	2023-03-27 20:41:22.264+07
43	20230310023532_create table saved_replies.js	20	2023-03-27 20:41:22.297+07
44	20230310215809_create mentions.js	20	2023-03-27 20:41:22.329+07
45	20230310222718_add subscribe.js	20	2023-03-27 20:41:22.346+07
46	20230310222952_ticket status histories.js	20	2023-03-27 20:41:22.372+07
47	20230310223440_add is_public to tickets.js	20	2023-03-27 20:41:22.376+07
48	20230310230959_add is_pin and is_locked to tickets.js	20	2023-03-27 20:41:22.378+07
49	20230311143202_create user_reactions.js	20	2023-03-27 20:41:22.402+07
50	20230311232530_rename table subscriptions to ticket subcriptions.js	20	2023-03-27 20:41:22.404+07
51	20230311232719_rename table users_reactions to tickets_reactions.js	20	2023-03-27 20:41:22.406+07
52	20230312010638_rename tickets_status_histories to tickets_histories.js	20	2023-03-27 20:41:22.408+07
53	20230312010743_rename ticket_subcriptions to tickets_subcriptions.js	20	2023-03-27 20:41:22.409+07
54	20230312011115_add column comment to tickets_histories.js	20	2023-03-27 20:41:22.411+07
55	20230312011719_rename column is_public to is_published, is_pin to is_pinned in tickets table.js	20	2023-03-27 20:41:22.414+07
56	20230312014333_add tickets_label.js	20	2023-03-27 20:41:22.426+07
57	20230318135053_create activities.js	20	2023-03-27 20:41:22.448+07
58	20230318141048_add ticket_id to activities.js	20	2023-03-27 20:41:22.453+07
59	20230318141210_add is_answer in comments_customers_agent.js	20	2023-03-27 20:41:22.456+07
60	20230319130445_add is_edited to comments_customer_agents.js	20	2023-03-27 20:41:22.458+07
61	20230319130713_add is_edited to ticket.js	20	2023-03-27 20:41:22.46+07
62	20230320031654_create comments-reactions.js	20	2023-03-27 20:41:22.473+07
63	20230320140232_rename table comments-reactions to comments_reactions.js	20	2023-03-27 20:41:22.475+07
64	20230324140918_rename title to name and reply to content in saved_replies.js	20	2023-03-27 20:41:22.477+07
65	20230327040122_add ticket_id to notifications.js	20	2023-03-27 20:41:22.485+07
\.


--
-- Data for Name: knex_migrations_lock; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.knex_migrations_lock (index, is_locked) FROM stdin;
3	0
\.


--
-- Data for Name: mentions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mentions (id, user_id, mention_by, ticket_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, type, title, content, "from", "to", read_at, created_at, type_id, role, ticket_id) FROM stdin;
74	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	113359564305461720000	\N	2022-11-12 07:08:23.758912+07	59749fe7-d7bd-4135-b6a0-b4a501e384ae	requester	\N
76	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	113359564305461720000	\N	2022-11-12 07:10:10.078099+07	59749fe7-d7bd-4135-b6a0-b4a501e384ae	requester	\N
77	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	113359564305461720000	\N	2022-11-12 07:12:07.933107+07	59749fe7-d7bd-4135-b6a0-b4a501e384ae	requester	\N
82	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	master|61442	\N	2022-11-12 13:52:13.108202+07	8f69ea77-b08e-4269-be92-3ce0e602f958	requester	\N
83	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|61442	\N	2022-11-12 13:53:22.617355+07	8f69ea77-b08e-4269-be92-3ce0e602f958	requester	\N
87	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	master|26742	\N	2022-11-12 14:05:20.298813+07	db65a963-23f5-4b60-bb80-c3f15040e92f	requester	\N
88	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	master|26742	\N	2022-11-12 14:06:14.063065+07	db65a963-23f5-4b60-bb80-c3f15040e92f	requester	\N
91	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	115201648402085603083	\N	2022-11-12 15:16:40.147717+07	4d64f511-5fc9-47ad-b3ed-69b6d76dbf5a	requester	\N
92	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	115201648402085603083	\N	2022-11-12 15:17:03.188497+07	4d64f511-5fc9-47ad-b3ed-69b6d76dbf5a	requester	\N
93	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	115201648402085603083	\N	2022-11-12 15:17:17.052715+07	4d64f511-5fc9-47ad-b3ed-69b6d76dbf5a	requester	\N
96	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	100057519768980321515	\N	2022-11-12 15:23:31.380186+07	47f07fd3-1782-42d1-bf7e-ba57fe2bdd60	requester	\N
100	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	master|26742	\N	2022-11-12 17:45:38.344955+07	db65a963-23f5-4b60-bb80-c3f15040e92f	requester	\N
101	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	master|26742	\N	2022-11-12 17:46:02.910697+07	db65a963-23f5-4b60-bb80-c3f15040e92f	requester	\N
85	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2022-11-12 17:46:51.331+07	2022-11-12 14:05:07.695+07	db65a963-23f5-4b60-bb80-c3f15040e92f	requester	\N
86	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2022-11-12 17:46:51.331+07	2022-11-12 14:05:07.695+07	db65a963-23f5-4b60-bb80-c3f15040e92f	admin	\N
102	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	master|56543	2022-11-12 17:46:51.331+07	2022-11-12 17:46:02.913155+07	db65a963-23f5-4b60-bb80-c3f15040e92f	admin	\N
103	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	115201648402085603083	\N	2022-11-12 18:18:35.228322+07	4d64f511-5fc9-47ad-b3ed-69b6d76dbf5a	requester	\N
106	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	113848363266517049246	\N	2022-11-12 18:59:17.394475+07	f24bc9df-6f65-4875-8090-c3204b76eed8	requester	\N
104	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2022-11-12 18:59:29.884+07	2022-11-12 18:57:23.736+07	f24bc9df-6f65-4875-8090-c3204b76eed8	requester	\N
105	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2022-11-12 18:59:29.884+07	2022-11-12 18:57:23.736+07	f24bc9df-6f65-4875-8090-c3204b76eed8	admin	\N
109	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	115588986970313388649	\N	2022-11-12 19:43:49.099934+07	fcc728ce-edca-4267-9c9e-10f8e99873e8	requester	\N
107	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2022-11-12 19:44:39.523+07	2022-11-12 19:43:27.013+07	fcc728ce-edca-4267-9c9e-10f8e99873e8	requester	\N
108	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2022-11-12 19:44:39.523+07	2022-11-12 19:43:27.013+07	fcc728ce-edca-4267-9c9e-10f8e99873e8	admin	\N
112	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	111850381925090480094	\N	2022-11-13 19:38:59.069974+07	de739ca3-b41a-4ed3-9d56-38b8b7333b71	requester	\N
113	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	111850381925090480094	\N	2022-11-13 19:39:48.996283+07	de739ca3-b41a-4ed3-9d56-38b8b7333b71	requester	\N
115	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	115588986970313388649	\N	2022-11-13 19:43:56.236109+07	fcc728ce-edca-4267-9c9e-10f8e99873e8	requester	\N
116	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	115588986970313388649	\N	2022-11-13 19:44:47.596814+07	fcc728ce-edca-4267-9c9e-10f8e99873e8	requester	\N
72	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2022-11-14 10:18:10.131+07	2022-11-12 07:07:30.739+07	59749fe7-d7bd-4135-b6a0-b4a501e384ae	requester	\N
73	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2022-11-14 10:18:10.131+07	2022-11-12 07:07:30.739+07	59749fe7-d7bd-4135-b6a0-b4a501e384ae	admin	\N
75	chats_customer_to_agent	Komentar	Mengomentari tiket anda	113359564305461720000	master|40	2022-11-14 10:18:10.131+07	2022-11-12 07:09:23.586508+07	59749fe7-d7bd-4135-b6a0-b4a501e384ae	agent	\N
78	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	2022-11-14 10:18:10.131+07	2022-11-12 07:12:07.935289+07	59749fe7-d7bd-4135-b6a0-b4a501e384ae	admin	\N
110	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2022-11-13 19:44:57.724+07	2022-11-13 19:35:59.379+07	de739ca3-b41a-4ed3-9d56-38b8b7333b71	requester	\N
111	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2022-11-13 19:44:57.724+07	2022-11-13 19:35:59.379+07	de739ca3-b41a-4ed3-9d56-38b8b7333b71	admin	\N
114	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	master|56543	2022-11-13 19:44:57.724+07	2022-11-13 19:39:48.999344+07	de739ca3-b41a-4ed3-9d56-38b8b7333b71	admin	\N
117	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	master|56543	2022-11-13 19:44:57.724+07	2022-11-13 19:44:47.599045+07	fcc728ce-edca-4267-9c9e-10f8e99873e8	admin	\N
118	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	113848363266517049246	\N	2022-11-13 19:45:53.81897+07	f24bc9df-6f65-4875-8090-c3204b76eed8	requester	\N
119	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	113848363266517049246	\N	2022-11-13 19:47:16.318943+07	f24bc9df-6f65-4875-8090-c3204b76eed8	requester	\N
120	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	master|56543	2022-11-13 19:47:24.503+07	2022-11-13 19:47:16.321132+07	f24bc9df-6f65-4875-8090-c3204b76eed8	admin	\N
123	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	117163524863752164050	\N	2022-11-13 19:53:41.341906+07	71faf21c-ab26-46ef-a7d6-5edd7422feca	requester	\N
124	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	117163524863752164050	\N	2022-11-13 19:55:10.205685+07	71faf21c-ab26-46ef-a7d6-5edd7422feca	requester	\N
121	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2022-11-13 19:55:16.17+07	2022-11-13 19:51:14.442+07	71faf21c-ab26-46ef-a7d6-5edd7422feca	requester	\N
122	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2022-11-13 19:55:16.17+07	2022-11-13 19:51:14.442+07	71faf21c-ab26-46ef-a7d6-5edd7422feca	admin	\N
125	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	master|56543	2022-11-13 19:55:16.17+07	2022-11-13 19:55:10.20796+07	71faf21c-ab26-46ef-a7d6-5edd7422feca	admin	\N
128	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	107895398294445282010	\N	2022-11-13 23:03:32.946687+07	54875844-5519-47b3-a36e-edc35824d152	requester	\N
131	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	pttpk|815	\N	2022-11-13 23:05:32.817706+07	087e0e16-6b12-497c-bbcc-ef252f0fcb79	requester	\N
134	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	master|70383	\N	2022-11-13 23:11:28.466695+07	09169b6c-d830-4fba-8e08-87993524b53b	requester	\N
135	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	115201648402085603083	\N	2022-11-13 23:13:13.665547+07	4d64f511-5fc9-47ad-b3ed-69b6d76dbf5a	requester	\N
138	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	pttpk|1383	\N	2022-11-13 23:14:21.183214+07	8c4e4117-056d-4a39-8602-5aabe70dd54b	requester	\N
141	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	111115756055921574714	\N	2022-11-13 23:16:51.661868+07	8acc14d2-965f-4a9a-b3ab-d85791fb92c8	requester	\N
146	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	118030064912755499107	\N	2022-11-13 23:22:54.687797+07	8514d159-c407-4a06-a630-ec8341a0073e	requester	\N
149	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	master|69837	\N	2022-11-14 04:28:13.166194+07	0efbc0dc-4032-4a1a-bfc1-47f5be78b541	requester	\N
79	feedback	Feedback	Memberikan feedback	113359564305461720000	master|40	2022-11-14 10:18:10.131+07	2022-11-12 07:13:24.970924+07	59749fe7-d7bd-4135-b6a0-b4a501e384ae	agent	\N
80	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2022-11-14 10:18:10.131+07	2022-11-12 10:59:42.253+07	8f69ea77-b08e-4269-be92-3ce0e602f958	requester	\N
81	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2022-11-14 10:18:10.131+07	2022-11-12 10:59:42.253+07	8f69ea77-b08e-4269-be92-3ce0e602f958	admin	\N
84	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	2022-11-14 10:18:10.131+07	2022-11-12 13:53:22.6195+07	8f69ea77-b08e-4269-be92-3ce0e602f958	admin	\N
89	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2022-11-14 10:18:10.131+07	2022-11-12 14:07:34.607+07	4d64f511-5fc9-47ad-b3ed-69b6d76dbf5a	requester	\N
90	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2022-11-14 10:18:10.131+07	2022-11-12 14:07:34.607+07	4d64f511-5fc9-47ad-b3ed-69b6d76dbf5a	admin	\N
126	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2022-11-14 10:18:10.131+07	2022-11-13 23:02:16.336+07	54875844-5519-47b3-a36e-edc35824d152	requester	\N
127	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2022-11-14 10:18:10.131+07	2022-11-13 23:02:16.336+07	54875844-5519-47b3-a36e-edc35824d152	admin	\N
129	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2022-11-14 10:18:10.131+07	2022-11-13 23:03:57.663+07	087e0e16-6b12-497c-bbcc-ef252f0fcb79	requester	\N
94	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2022-11-14 10:18:10.131+07	2022-11-12 15:18:30.279+07	47f07fd3-1782-42d1-bf7e-ba57fe2bdd60	requester	\N
95	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2022-11-14 10:18:10.131+07	2022-11-12 15:18:30.279+07	47f07fd3-1782-42d1-bf7e-ba57fe2bdd60	admin	\N
97	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	2022-11-14 10:18:10.131+07	2022-11-12 15:23:31.382128+07	47f07fd3-1782-42d1-bf7e-ba57fe2bdd60	admin	\N
98	chats_customer_to_agent	Komentar	Mengomentari tiket anda	115201648402085603083	master|40	2022-11-14 10:18:10.131+07	2022-11-12 15:51:37.165925+07	4d64f511-5fc9-47ad-b3ed-69b6d76dbf5a	agent	\N
99	chats_customer_to_agent	Komentar	Mengomentari tiket anda	115201648402085603083	master|40	2022-11-14 10:18:10.131+07	2022-11-12 15:56:34.631929+07	4d64f511-5fc9-47ad-b3ed-69b6d76dbf5a	agent	\N
130	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2022-11-14 10:18:10.131+07	2022-11-13 23:03:57.663+07	087e0e16-6b12-497c-bbcc-ef252f0fcb79	admin	\N
132	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2022-11-14 10:18:10.131+07	2022-11-13 23:09:25.689+07	09169b6c-d830-4fba-8e08-87993524b53b	requester	\N
133	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2022-11-14 10:18:10.131+07	2022-11-13 23:09:25.689+07	09169b6c-d830-4fba-8e08-87993524b53b	admin	\N
136	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2022-11-14 10:18:10.131+07	2022-11-13 23:13:32.807+07	8c4e4117-056d-4a39-8602-5aabe70dd54b	requester	\N
137	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2022-11-14 10:18:10.131+07	2022-11-13 23:13:32.807+07	8c4e4117-056d-4a39-8602-5aabe70dd54b	admin	\N
139	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2022-11-14 10:18:10.131+07	2022-11-13 23:15:32.142+07	8acc14d2-965f-4a9a-b3ab-d85791fb92c8	requester	\N
140	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2022-11-14 10:18:10.131+07	2022-11-13 23:15:32.142+07	8acc14d2-965f-4a9a-b3ab-d85791fb92c8	admin	\N
142	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2022-11-14 10:18:10.131+07	2022-11-13 23:18:34.315+07	7dc1acc0-77f8-4ec0-8132-54acf8b7cda3	requester	\N
143	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2022-11-14 10:18:10.131+07	2022-11-13 23:18:34.315+07	7dc1acc0-77f8-4ec0-8132-54acf8b7cda3	admin	\N
144	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2022-11-14 10:18:10.131+07	2022-11-13 23:21:48.414+07	8514d159-c407-4a06-a630-ec8341a0073e	requester	\N
145	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2022-11-14 10:18:10.131+07	2022-11-13 23:21:48.414+07	8514d159-c407-4a06-a630-ec8341a0073e	admin	\N
147	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2022-11-14 10:18:10.131+07	2022-11-14 04:24:18.971+07	0efbc0dc-4032-4a1a-bfc1-47f5be78b541	requester	\N
148	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2022-11-14 10:18:10.131+07	2022-11-14 04:24:18.971+07	0efbc0dc-4032-4a1a-bfc1-47f5be78b541	admin	\N
151	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|69837	\N	2022-11-15 08:44:08.59229+07	0efbc0dc-4032-4a1a-bfc1-47f5be78b541	requester	\N
155	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	master|59715	\N	2022-11-15 08:48:43.219011+07	d8b8dd9f-13ce-4993-9548-bcd5590d722e	requester	\N
158	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	master|61442	\N	2022-11-15 17:58:49.389227+07	edd18c5f-f656-49a9-b8f3-9a038b4ea8ac	requester	\N
159	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	master|61442	\N	2022-11-15 18:02:35.329882+07	edd18c5f-f656-49a9-b8f3-9a038b4ea8ac	requester	\N
156	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2022-11-15 18:02:42.752+07	2022-11-15 17:57:57.461+07	edd18c5f-f656-49a9-b8f3-9a038b4ea8ac	requester	\N
157	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2022-11-15 18:02:42.752+07	2022-11-15 17:57:57.461+07	edd18c5f-f656-49a9-b8f3-9a038b4ea8ac	admin	\N
160	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	master|56543	2022-11-15 18:02:42.752+07	2022-11-15 18:02:35.331994+07	edd18c5f-f656-49a9-b8f3-9a038b4ea8ac	admin	\N
163	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	105106952708336013003	\N	2022-11-15 18:05:12.601359+07	6e45b099-9a8d-489e-941d-efed7ead63db	requester	\N
161	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2022-11-15 18:05:20.494+07	2022-11-15 18:03:28.747+07	6e45b099-9a8d-489e-941d-efed7ead63db	requester	\N
162	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2022-11-15 18:05:20.494+07	2022-11-15 18:03:28.747+07	6e45b099-9a8d-489e-941d-efed7ead63db	admin	\N
166	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	116327472568778270097	\N	2022-11-15 18:08:08.673217+07	6a96c555-62a9-411e-9150-4769e680b1e2	requester	\N
164	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2022-11-15 18:08:17.973+07	2022-11-15 18:06:10.596+07	6a96c555-62a9-411e-9150-4769e680b1e2	requester	\N
165	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2022-11-15 18:08:17.973+07	2022-11-15 18:06:10.596+07	6a96c555-62a9-411e-9150-4769e680b1e2	admin	\N
169	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	116423286111481434115	\N	2022-11-15 18:11:58.934148+07	61b169b4-3d4b-43b5-84dd-1668ed222e8a	requester	\N
167	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2022-11-15 18:12:13.122+07	2022-11-15 18:09:19.423+07	61b169b4-3d4b-43b5-84dd-1668ed222e8a	requester	\N
168	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2022-11-15 18:12:13.122+07	2022-11-15 18:09:19.423+07	61b169b4-3d4b-43b5-84dd-1668ed222e8a	admin	\N
170	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	116423286111481434115	\N	2022-11-15 18:14:09.200519+07	61b169b4-3d4b-43b5-84dd-1668ed222e8a	requester	\N
171	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	116423286111481434115	\N	2022-11-15 18:15:03.95882+07	61b169b4-3d4b-43b5-84dd-1668ed222e8a	requester	\N
172	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	master|56543	2022-11-15 18:15:08.602+07	2022-11-15 18:15:03.96032+07	61b169b4-3d4b-43b5-84dd-1668ed222e8a	admin	\N
175	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	master|70273	\N	2022-11-16 05:33:17.262461+07	3087e298-da93-4d1a-bcbf-355b0887cc74	requester	\N
176	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	105106952708336013003	\N	2022-11-17 13:55:50.190231+07	6e45b099-9a8d-489e-941d-efed7ead63db	requester	\N
177	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	105106952708336013003	\N	2022-11-17 13:56:35.695577+07	6e45b099-9a8d-489e-941d-efed7ead63db	requester	\N
179	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	116327472568778270097	\N	2022-11-17 13:57:02.568294+07	6a96c555-62a9-411e-9150-4769e680b1e2	requester	\N
180	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	116327472568778270097	\N	2022-11-17 13:58:08.570626+07	6a96c555-62a9-411e-9150-4769e680b1e2	requester	\N
178	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	master|56543	2022-11-17 13:58:44.663+07	2022-11-17 13:56:35.700417+07	6e45b099-9a8d-489e-941d-efed7ead63db	admin	\N
181	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	master|56543	2022-11-17 13:58:44.663+07	2022-11-17 13:58:08.576446+07	6a96c555-62a9-411e-9150-4769e680b1e2	admin	\N
184	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	master|9312	\N	2022-11-17 13:59:55.142722+07	b5217503-273b-4b6e-8026-2c712f3d994a	requester	\N
185	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	master|9312	\N	2022-11-17 14:06:21.961461+07	b5217503-273b-4b6e-8026-2c712f3d994a	requester	\N
186	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	master|9312	\N	2022-11-17 14:07:35.722751+07	b5217503-273b-4b6e-8026-2c712f3d994a	requester	\N
182	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2022-11-17 14:08:19.167+07	2022-11-17 13:58:53.83+07	b5217503-273b-4b6e-8026-2c712f3d994a	requester	\N
183	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2022-11-17 14:08:19.167+07	2022-11-17 13:58:53.83+07	b5217503-273b-4b6e-8026-2c712f3d994a	admin	\N
187	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	master|56543	2022-11-17 14:08:19.167+07	2022-11-17 14:07:35.724931+07	b5217503-273b-4b6e-8026-2c712f3d994a	admin	\N
190	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	master|67134	\N	2022-11-20 00:40:19.670009+07	6a7cfdc5-7dd9-4f2b-b1c4-3fb47b586614	requester	\N
191	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|70273	\N	2022-11-20 00:41:28.783208+07	3087e298-da93-4d1a-bcbf-355b0887cc74	requester	\N
193	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|59715	\N	2022-11-20 00:41:55.551907+07	d8b8dd9f-13ce-4993-9548-bcd5590d722e	requester	\N
198	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	109524029811118075633	\N	2022-11-21 19:17:18.311425+07	f979042d-a5c0-4b5c-9909-830841e37325	requester	\N
199	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	109524029811118075633	\N	2022-11-21 19:17:25.170773+07	f979042d-a5c0-4b5c-9909-830841e37325	requester	\N
196	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2022-11-21 19:17:37.276+07	2022-11-21 19:15:56.366+07	f979042d-a5c0-4b5c-9909-830841e37325	requester	\N
197	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2022-11-21 19:17:37.276+07	2022-11-21 19:15:56.366+07	f979042d-a5c0-4b5c-9909-830841e37325	admin	\N
200	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	master|56543	2022-11-21 19:17:37.276+07	2022-11-21 19:17:25.173575+07	f979042d-a5c0-4b5c-9909-830841e37325	admin	\N
204	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	105503740477298041174	\N	2023-01-28 18:36:07.218213+07	413d31a6-88e6-4743-ab4c-c7d9ce5d3b12	requester	\N
206	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	105503740477298041174	\N	2023-01-28 18:38:11.140666+07	413d31a6-88e6-4743-ab4c-c7d9ce5d3b12	requester	\N
208	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	105503740477298041174	\N	2023-01-28 18:38:50.220829+07	413d31a6-88e6-4743-ab4c-c7d9ce5d3b12	requester	\N
209	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	105503740477298041174	\N	2023-01-28 18:39:01.910636+07	413d31a6-88e6-4743-ab4c-c7d9ce5d3b12	requester	\N
211	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	105503740477298041174	\N	2023-01-28 18:41:23.491098+07	413d31a6-88e6-4743-ab4c-c7d9ce5d3b12	requester	\N
214	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|70383	\N	2023-02-13 18:06:43.133441+07	09169b6c-d830-4fba-8e08-87993524b53b	requester	\N
218	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	115066139582912607057	\N	2023-02-13 18:24:17.767406+07	73dbd6d9-c8b7-4657-bfa0-32a581f73a8b	requester	\N
219	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	115066139582912607057	\N	2023-02-13 18:25:02.1257+07	73dbd6d9-c8b7-4657-bfa0-32a581f73a8b	requester	\N
150	chats_customer_to_agent	Komentar	Mengomentari tiket anda	master|69837	master|40	2023-02-13 23:44:22.407+07	2022-11-14 14:12:11.384556+07	0efbc0dc-4032-4a1a-bfc1-47f5be78b541	agent	\N
152	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	2023-02-13 23:44:22.407+07	2022-11-15 08:44:08.594475+07	0efbc0dc-4032-4a1a-bfc1-47f5be78b541	admin	\N
153	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2023-02-13 23:44:22.407+07	2022-11-15 08:46:24.806+07	d8b8dd9f-13ce-4993-9548-bcd5590d722e	requester	\N
202	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2023-02-21 21:30:24.753+07	2023-01-28 18:31:31.919+07	413d31a6-88e6-4743-ab4c-c7d9ce5d3b12	requester	\N
203	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2023-02-21 21:30:24.753+07	2023-01-28 18:31:31.919+07	413d31a6-88e6-4743-ab4c-c7d9ce5d3b12	admin	\N
205	chats_customer_to_agent	Komentar	Mengomentari tiket anda	105503740477298041174	master|56543	2023-02-21 21:30:24.753+07	2023-01-28 18:37:47.103794+07	413d31a6-88e6-4743-ab4c-c7d9ce5d3b12	agent	\N
207	chats_customer_to_agent	Komentar	Mengomentari tiket anda	105503740477298041174	master|56543	2023-02-21 21:30:24.753+07	2023-01-28 18:38:24.019152+07	413d31a6-88e6-4743-ab4c-c7d9ce5d3b12	agent	\N
210	chats_customer_to_agent	Komentar	Mengomentari tiket anda	105503740477298041174	master|56543	2023-02-21 21:30:24.753+07	2023-01-28 18:39:14.143326+07	413d31a6-88e6-4743-ab4c-c7d9ce5d3b12	agent	\N
212	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	master|56543	2023-02-21 21:30:24.753+07	2023-01-28 18:41:23.49338+07	413d31a6-88e6-4743-ab4c-c7d9ce5d3b12	admin	\N
213	feedback	Feedback	Memberikan feedback	105503740477298041174	master|56543	2023-02-21 21:30:24.753+07	2023-01-28 18:42:30.283104+07	413d31a6-88e6-4743-ab4c-c7d9ce5d3b12	agent	\N
154	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2023-02-13 23:44:22.407+07	2022-11-15 08:46:24.806+07	d8b8dd9f-13ce-4993-9548-bcd5590d722e	admin	\N
173	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2023-02-13 23:44:22.407+07	2022-11-16 05:31:51.302+07	3087e298-da93-4d1a-bcbf-355b0887cc74	requester	\N
174	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2023-02-13 23:44:22.407+07	2022-11-16 05:31:51.302+07	3087e298-da93-4d1a-bcbf-355b0887cc74	admin	\N
188	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2023-02-13 23:44:22.407+07	2022-11-20 00:37:20.937+07	6a7cfdc5-7dd9-4f2b-b1c4-3fb47b586614	requester	\N
189	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2023-02-13 23:44:22.407+07	2022-11-20 00:37:20.937+07	6a7cfdc5-7dd9-4f2b-b1c4-3fb47b586614	admin	\N
192	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	2023-02-13 23:44:22.407+07	2022-11-20 00:41:28.785486+07	3087e298-da93-4d1a-bcbf-355b0887cc74	admin	\N
194	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	2023-02-13 23:44:22.407+07	2022-11-20 00:41:55.553536+07	d8b8dd9f-13ce-4993-9548-bcd5590d722e	admin	\N
195	chats_customer_to_agent	Komentar	Mengomentari tiket anda	master|67134	master|40	2023-02-13 23:44:22.407+07	2022-11-20 21:03:50.855456+07	6a7cfdc5-7dd9-4f2b-b1c4-3fb47b586614	agent	\N
201	chats_customer_to_agent	Komentar	Mengomentari tiket anda	master|67134	master|40	2023-02-13 23:44:22.407+07	2022-11-22 22:39:35.032702+07	6a7cfdc5-7dd9-4f2b-b1c4-3fb47b586614	agent	\N
215	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	2023-02-13 23:44:22.407+07	2023-02-13 18:06:43.135965+07	09169b6c-d830-4fba-8e08-87993524b53b	admin	\N
216	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2023-02-13 23:44:22.407+07	2023-02-13 18:07:11.436+07	73dbd6d9-c8b7-4657-bfa0-32a581f73a8b	requester	\N
217	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2023-02-13 23:44:22.407+07	2023-02-13 18:07:11.436+07	73dbd6d9-c8b7-4657-bfa0-32a581f73a8b	admin	\N
220	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	2023-02-13 23:44:22.407+07	2023-02-13 18:25:02.127619+07	73dbd6d9-c8b7-4657-bfa0-32a581f73a8b	admin	\N
223	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	master|46893	\N	2023-02-21 21:25:46.001244+07	ea572511-e79c-438d-b2c9-57461f824877	requester	\N
224	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	master|46893	\N	2023-02-21 21:26:05.812887+07	ea572511-e79c-438d-b2c9-57461f824877	requester	\N
225	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	master|46893	\N	2023-02-21 21:26:17.800866+07	ea572511-e79c-438d-b2c9-57461f824877	requester	\N
229	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	master|34233	\N	2023-02-21 21:28:59.959889+07	aea2f495-f927-4ae5-89ae-d6a2185b470a	requester	\N
230	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	master|34233	\N	2023-02-21 21:29:39.788352+07	aea2f495-f927-4ae5-89ae-d6a2185b470a	requester	\N
221	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2023-02-21 21:30:24.753+07	2023-02-21 21:24:50.227+07	ea572511-e79c-438d-b2c9-57461f824877	requester	\N
222	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2023-02-21 21:30:24.753+07	2023-02-21 21:24:50.227+07	ea572511-e79c-438d-b2c9-57461f824877	admin	\N
226	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	master|56543	2023-02-21 21:30:24.753+07	2023-02-21 21:26:17.806174+07	ea572511-e79c-438d-b2c9-57461f824877	admin	\N
227	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2023-02-21 21:30:24.753+07	2023-02-21 21:27:29.904+07	aea2f495-f927-4ae5-89ae-d6a2185b470a	requester	\N
228	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2023-02-21 21:30:24.753+07	2023-02-21 21:27:29.904+07	aea2f495-f927-4ae5-89ae-d6a2185b470a	admin	\N
231	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	master|56543	2023-02-21 21:30:24.753+07	2023-02-21 21:29:39.790613+07	aea2f495-f927-4ae5-89ae-d6a2185b470a	admin	\N
234	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	108416657661466806916	\N	2023-02-22 06:51:11.215632+07	08257e06-61fe-45d0-a4d2-aff508366c9b	requester	\N
238	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	master|61417	\N	2023-02-23 03:13:10.808661+07	1c7609c9-3aa0-4203-a6a3-5f0d8a59c81c	requester	\N
241	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	108063347615393395047	\N	2023-02-23 03:15:05.49596+07	aa855d32-a369-4851-b582-b4e4e2f3e470	requester	\N
242	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	115066139582912607057	\N	2023-02-23 03:18:00.488178+07	57bcd4af-3e31-4917-9ca0-f45031fd1e24	requester	\N
245	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	master|61149	\N	2023-02-23 03:25:09.173433+07	1c4a774b-1873-4cea-b470-e572dca19630	requester	\N
248	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	115066139582912607057	\N	2023-02-23 03:26:15.722388+07	57bcd4af-3e31-4917-9ca0-f45031fd1e24	requester	\N
251	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	master|61478	\N	2023-02-23 03:28:41.061787+07	7863a74a-7818-4dbb-9671-28d8ea959814	requester	\N
254	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	master|61725	\N	2023-02-23 03:31:30.22664+07	eaf81bb0-140d-4b20-bac9-527ebd380432	requester	\N
257	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	107951032401848979939	\N	2023-02-23 06:47:07.738575+07	433c6db8-ea17-4dd4-b5ba-d123cec4fa15	requester	\N
260	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	master|61524	\N	2023-02-23 06:49:34.243+07	0066fad9-9e93-4844-b75c-fc269469f579	requester	\N
232	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2023-02-23 08:59:05.057+07	2023-02-22 06:49:04.997+07	08257e06-61fe-45d0-a4d2-aff508366c9b	requester	\N
233	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2023-02-23 08:59:05.057+07	2023-02-22 06:49:04.997+07	08257e06-61fe-45d0-a4d2-aff508366c9b	admin	\N
235	chats_customer_to_agent	Komentar	Mengomentari tiket anda	108416657661466806916	master|40	2023-02-23 08:59:05.057+07	2023-02-22 07:14:18.043759+07	08257e06-61fe-45d0-a4d2-aff508366c9b	agent	\N
236	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2023-02-23 08:59:05.057+07	2023-02-23 03:11:10.651+07	1c7609c9-3aa0-4203-a6a3-5f0d8a59c81c	requester	\N
237	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2023-02-23 08:59:05.057+07	2023-02-23 03:11:10.651+07	1c7609c9-3aa0-4203-a6a3-5f0d8a59c81c	admin	\N
239	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2023-02-23 08:59:05.057+07	2023-02-23 03:13:41.426+07	aa855d32-a369-4851-b582-b4e4e2f3e470	requester	\N
240	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2023-02-23 08:59:05.057+07	2023-02-23 03:13:41.426+07	aa855d32-a369-4851-b582-b4e4e2f3e470	admin	\N
243	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2023-02-23 08:59:05.057+07	2023-02-23 03:23:10.52+07	1c4a774b-1873-4cea-b470-e572dca19630	requester	\N
244	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2023-02-23 08:59:05.057+07	2023-02-23 03:23:10.52+07	1c4a774b-1873-4cea-b470-e572dca19630	admin	\N
246	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2023-02-23 08:59:05.057+07	2023-02-23 03:25:41.135+07	57bcd4af-3e31-4917-9ca0-f45031fd1e24	requester	\N
247	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2023-02-23 08:59:05.057+07	2023-02-23 03:25:41.135+07	57bcd4af-3e31-4917-9ca0-f45031fd1e24	admin	\N
249	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2023-02-23 08:59:05.057+07	2023-02-23 03:26:33.812+07	7863a74a-7818-4dbb-9671-28d8ea959814	requester	\N
250	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2023-02-23 08:59:05.057+07	2023-02-23 03:26:33.812+07	7863a74a-7818-4dbb-9671-28d8ea959814	admin	\N
252	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2023-02-23 08:59:05.057+07	2023-02-23 03:30:05.967+07	eaf81bb0-140d-4b20-bac9-527ebd380432	requester	\N
253	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2023-02-23 08:59:05.057+07	2023-02-23 03:30:05.967+07	eaf81bb0-140d-4b20-bac9-527ebd380432	admin	\N
255	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2023-02-23 08:59:05.057+07	2023-02-23 06:45:31.413+07	433c6db8-ea17-4dd4-b5ba-d123cec4fa15	requester	\N
256	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2023-02-23 08:59:05.057+07	2023-02-23 06:45:31.413+07	433c6db8-ea17-4dd4-b5ba-d123cec4fa15	admin	\N
258	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2023-02-23 08:59:05.057+07	2023-02-23 06:48:22.519+07	0066fad9-9e93-4844-b75c-fc269469f579	requester	\N
259	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	2023-02-23 08:59:05.057+07	2023-02-23 06:48:22.519+07	0066fad9-9e93-4844-b75c-fc269469f579	admin	\N
261	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|61524	\N	2023-03-02 05:21:48.355064+07	0066fad9-9e93-4844-b75c-fc269469f579	requester	\N
262	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-02 05:21:48.357366+07	0066fad9-9e93-4844-b75c-fc269469f579	admin	\N
263	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	107951032401848979939	\N	2023-03-02 05:22:40.127627+07	433c6db8-ea17-4dd4-b5ba-d123cec4fa15	requester	\N
264	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-02 05:22:40.129823+07	433c6db8-ea17-4dd4-b5ba-d123cec4fa15	admin	\N
265	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|61725	\N	2023-03-02 05:22:53.207475+07	eaf81bb0-140d-4b20-bac9-527ebd380432	requester	\N
266	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-02 05:22:53.209336+07	eaf81bb0-140d-4b20-bac9-527ebd380432	admin	\N
267	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|61478	\N	2023-03-02 05:23:07.503705+07	7863a74a-7818-4dbb-9671-28d8ea959814	requester	\N
268	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-02 05:23:07.50554+07	7863a74a-7818-4dbb-9671-28d8ea959814	admin	\N
269	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	115066139582912607057	\N	2023-03-02 05:23:52.86632+07	57bcd4af-3e31-4917-9ca0-f45031fd1e24	requester	\N
270	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-02 05:23:52.868128+07	57bcd4af-3e31-4917-9ca0-f45031fd1e24	admin	\N
271	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|61149	\N	2023-03-02 05:24:04.801119+07	1c4a774b-1873-4cea-b470-e572dca19630	requester	\N
272	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-02 05:24:04.802764+07	1c4a774b-1873-4cea-b470-e572dca19630	admin	\N
273	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	108063347615393395047	\N	2023-03-02 05:24:24.739535+07	aa855d32-a369-4851-b582-b4e4e2f3e470	requester	\N
274	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-02 05:24:24.74095+07	aa855d32-a369-4851-b582-b4e4e2f3e470	admin	\N
275	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|61417	\N	2023-03-02 05:24:39.76503+07	1c7609c9-3aa0-4203-a6a3-5f0d8a59c81c	requester	\N
276	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-02 05:24:39.768773+07	1c7609c9-3aa0-4203-a6a3-5f0d8a59c81c	admin	\N
277	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	108416657661466806916	\N	2023-03-02 05:24:55.13267+07	08257e06-61fe-45d0-a4d2-aff508366c9b	requester	\N
278	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-02 05:24:55.134859+07	08257e06-61fe-45d0-a4d2-aff508366c9b	admin	\N
279	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|67134	\N	2023-03-02 05:25:12.282802+07	6a7cfdc5-7dd9-4f2b-b1c4-3fb47b586614	requester	\N
280	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-02 05:25:12.284284+07	6a7cfdc5-7dd9-4f2b-b1c4-3fb47b586614	admin	\N
281	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	118030064912755499107	\N	2023-03-02 05:26:28.576547+07	8514d159-c407-4a06-a630-ec8341a0073e	requester	\N
282	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-02 05:26:28.578775+07	8514d159-c407-4a06-a630-ec8341a0073e	admin	\N
283	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	110270258097436281823	\N	2023-03-02 05:26:45.300051+07	7dc1acc0-77f8-4ec0-8132-54acf8b7cda3	requester	\N
284	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-02 05:26:45.301344+07	7dc1acc0-77f8-4ec0-8132-54acf8b7cda3	admin	\N
285	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	111115756055921574714	\N	2023-03-02 05:27:00.538483+07	8acc14d2-965f-4a9a-b3ab-d85791fb92c8	requester	\N
286	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-02 05:27:00.539914+07	8acc14d2-965f-4a9a-b3ab-d85791fb92c8	admin	\N
287	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	pttpk|1383	\N	2023-03-02 05:27:15.615438+07	8c4e4117-056d-4a39-8602-5aabe70dd54b	requester	\N
288	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-02 05:27:15.616717+07	8c4e4117-056d-4a39-8602-5aabe70dd54b	admin	\N
289	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	pttpk|815	\N	2023-03-02 05:27:30.423797+07	087e0e16-6b12-497c-bbcc-ef252f0fcb79	requester	\N
290	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-02 05:27:30.424944+07	087e0e16-6b12-497c-bbcc-ef252f0fcb79	admin	\N
291	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	107895398294445282010	\N	2023-03-02 05:27:59.288087+07	54875844-5519-47b3-a36e-edc35824d152	requester	\N
292	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-02 05:27:59.289521+07	54875844-5519-47b3-a36e-edc35824d152	admin	\N
293	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-02 05:28:35.888+07	951d8663-bf2d-4f58-8945-c71df19d40e4	requester	\N
294	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-02 05:28:35.888+07	951d8663-bf2d-4f58-8945-c71df19d40e4	admin	\N
299	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|68842	\N	2023-03-02 05:29:39.046915+07	c802d06d-41f7-4838-9e76-81c2655f3686	requester	\N
300	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-02 05:29:39.048445+07	c802d06d-41f7-4838-9e76-81c2655f3686	admin	\N
301	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-02 05:30:28.106+07	bbfb1e5c-b295-4388-a8c4-d11e7e6f17be	requester	\N
302	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-02 05:30:28.106+07	bbfb1e5c-b295-4388-a8c4-d11e7e6f17be	admin	\N
315	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-02 05:32:42.808+07	203b4f3e-9e92-4de7-b1cf-712a0a00c50c	requester	\N
316	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-02 05:32:42.808+07	203b4f3e-9e92-4de7-b1cf-712a0a00c50c	admin	\N
295	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|65684	\N	2023-03-02 05:28:44.084673+07	951d8663-bf2d-4f58-8945-c71df19d40e4	requester	\N
296	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-02 05:28:44.086128+07	951d8663-bf2d-4f58-8945-c71df19d40e4	admin	\N
297	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-02 05:29:28.374+07	c802d06d-41f7-4838-9e76-81c2655f3686	requester	\N
298	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-02 05:29:28.374+07	c802d06d-41f7-4838-9e76-81c2655f3686	admin	\N
303	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	114775807296498901327	\N	2023-03-02 05:30:37.268301+07	bbfb1e5c-b295-4388-a8c4-d11e7e6f17be	requester	\N
304	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-02 05:30:37.274214+07	bbfb1e5c-b295-4388-a8c4-d11e7e6f17be	admin	\N
305	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-02 05:31:00.122+07	a5155cbc-8999-49d5-95eb-bb718941a13d	requester	\N
306	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-02 05:31:00.122+07	a5155cbc-8999-49d5-95eb-bb718941a13d	admin	\N
307	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	108420766870636421264	\N	2023-03-02 05:31:09.110804+07	a5155cbc-8999-49d5-95eb-bb718941a13d	requester	\N
308	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-02 05:31:09.112409+07	a5155cbc-8999-49d5-95eb-bb718941a13d	admin	\N
309	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	115201648402085603083	\N	2023-03-02 05:31:28.863665+07	4d64f511-5fc9-47ad-b3ed-69b6d76dbf5a	requester	\N
310	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-02 05:31:28.864918+07	4d64f511-5fc9-47ad-b3ed-69b6d76dbf5a	admin	\N
311	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-02 05:31:48.158+07	1c91e46b-de43-47a6-be17-0b3aaaf3f86e	requester	\N
312	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-02 05:31:48.158+07	1c91e46b-de43-47a6-be17-0b3aaaf3f86e	admin	\N
313	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|62808	\N	2023-03-02 05:31:55.995651+07	1c91e46b-de43-47a6-be17-0b3aaaf3f86e	requester	\N
314	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-02 05:31:55.996811+07	1c91e46b-de43-47a6-be17-0b3aaaf3f86e	admin	\N
317	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	pttpk|9773	\N	2023-03-02 05:32:51.35458+07	203b4f3e-9e92-4de7-b1cf-712a0a00c50c	requester	\N
318	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-02 05:32:51.35979+07	203b4f3e-9e92-4de7-b1cf-712a0a00c50c	admin	\N
319	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-02 05:33:06.498+07	db63cbe4-bdc0-4eb0-9678-bff8a24544c9	requester	\N
320	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-02 05:33:06.498+07	db63cbe4-bdc0-4eb0-9678-bff8a24544c9	admin	\N
321	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	113640464347712321324	\N	2023-03-02 05:33:15.398175+07	db63cbe4-bdc0-4eb0-9678-bff8a24544c9	requester	\N
322	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-02 05:33:15.399469+07	db63cbe4-bdc0-4eb0-9678-bff8a24544c9	admin	\N
323	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|95	103921334554472834759	\N	2023-03-02 10:49:58.38119+07	e6f6b651-f891-406a-bdd0-bf1aa7039451	requester	\N
324	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|95	master|95	\N	2023-03-02 10:50:23.221+07	e6f6b651-f891-406a-bdd0-bf1aa7039451	requester	\N
325	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|95	master|95	\N	2023-03-02 10:50:23.221+07	e6f6b651-f891-406a-bdd0-bf1aa7039451	admin	\N
326	chats_customer_to_agent	Komentar	Mengomentari tiket anda	103921334554472834759	master|95	\N	2023-03-02 10:50:44.874877+07	e6f6b651-f891-406a-bdd0-bf1aa7039451	agent	\N
327	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|95	103921334554472834759	\N	2023-03-02 10:51:04.613916+07	e6f6b651-f891-406a-bdd0-bf1aa7039451	requester	\N
328	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|95	103921334554472834759	\N	2023-03-02 10:51:25.47166+07	e6f6b651-f891-406a-bdd0-bf1aa7039451	requester	\N
329	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|95	master|95	\N	2023-03-02 10:51:25.473107+07	e6f6b651-f891-406a-bdd0-bf1aa7039451	admin	\N
330	feedback	Feedback	Memberikan feedback	103921334554472834759	master|95	\N	2023-03-02 10:51:50.266736+07	e6f6b651-f891-406a-bdd0-bf1aa7039451	agent	\N
333	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	master|56548	2023-03-03 14:42:10.849+07	2023-03-03 14:35:02.708679+07	cf74bd69-35f8-477e-a218-0b0a6216cb70	requester	\N
334	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	master|56548	2023-03-03 14:42:10.849+07	2023-03-03 14:36:23.394634+07	cf74bd69-35f8-477e-a218-0b0a6216cb70	requester	\N
335	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	master|56548	2023-03-03 14:42:10.849+07	2023-03-03 14:40:09.796773+07	cf74bd69-35f8-477e-a218-0b0a6216cb70	requester	\N
339	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	master|56552	\N	2023-03-03 14:49:26.630327+07	fdf83f2f-706c-480a-9080-d4736ee70f93	requester	\N
341	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	master|56552	\N	2023-03-03 14:49:58.872907+07	fdf83f2f-706c-480a-9080-d4736ee70f93	requester	\N
342	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	master|56552	\N	2023-03-03 14:50:25.166328+07	fdf83f2f-706c-480a-9080-d4736ee70f93	requester	\N
347	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56545	master|18225	\N	2023-03-03 15:52:38.909339+07	79721281-b742-47e5-abb6-598c59e5c3be	requester	\N
331	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2023-03-03 20:03:38.159+07	2023-03-03 14:33:24.296+07	cf74bd69-35f8-477e-a218-0b0a6216cb70	requester	\N
344	feedback	Feedback	Memberikan feedback	master|56552	master|56543	2023-03-03 20:03:38.159+07	2023-03-03 14:51:35.000603+07	fdf83f2f-706c-480a-9080-d4736ee70f93	agent	\N
348	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56545	master|18225	\N	2023-03-03 15:55:26.85164+07	79721281-b742-47e5-abb6-598c59e5c3be	requester	\N
349	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56545	master|18225	\N	2023-03-03 15:59:55.688088+07	79721281-b742-47e5-abb6-598c59e5c3be	requester	\N
345	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56545	master|56545	2023-03-03 16:05:19.529+07	2023-03-03 15:42:56.33+07	79721281-b742-47e5-abb6-598c59e5c3be	requester	\N
332	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2023-03-03 20:03:38.159+07	2023-03-03 14:33:24.296+07	cf74bd69-35f8-477e-a218-0b0a6216cb70	admin	\N
336	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	master|56543	2023-03-03 20:03:38.159+07	2023-03-03 14:40:09.799264+07	cf74bd69-35f8-477e-a218-0b0a6216cb70	admin	\N
337	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2023-03-03 20:03:38.159+07	2023-03-03 14:49:15.614+07	fdf83f2f-706c-480a-9080-d4736ee70f93	requester	\N
338	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2023-03-03 20:03:38.159+07	2023-03-03 14:49:15.614+07	fdf83f2f-706c-480a-9080-d4736ee70f93	admin	\N
340	chats_customer_to_agent	Komentar	Mengomentari tiket anda	master|56552	master|56543	2023-03-03 20:03:38.159+07	2023-03-03 14:49:48.738579+07	fdf83f2f-706c-480a-9080-d4736ee70f93	agent	\N
343	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	master|56543	2023-03-03 20:03:38.159+07	2023-03-03 14:50:25.172607+07	fdf83f2f-706c-480a-9080-d4736ee70f93	admin	\N
346	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56545	master|56543	2023-03-03 20:03:38.159+07	2023-03-03 15:42:56.33+07	79721281-b742-47e5-abb6-598c59e5c3be	admin	\N
350	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56545	master|56543	2023-03-03 20:03:38.159+07	2023-03-03 15:59:55.690597+07	79721281-b742-47e5-abb6-598c59e5c3be	admin	\N
351	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-03 20:46:17.893+07	f9c67d42-3751-4295-b61f-5074a96f8394	requester	\N
352	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-03 20:46:17.893+07	f9c67d42-3751-4295-b61f-5074a96f8394	admin	\N
353	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	pttpk|9590	\N	2023-03-03 20:47:51.958486+07	f9c67d42-3751-4295-b61f-5074a96f8394	requester	\N
354	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	pttpk|9590	\N	2023-03-04 10:27:43.845213+07	f9c67d42-3751-4295-b61f-5074a96f8394	requester	\N
355	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-04 10:27:43.84744+07	f9c67d42-3751-4295-b61f-5074a96f8394	admin	\N
356	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|56548	\N	2023-03-06 12:47:28.936+07	74e03d35-8f37-4d70-b5b5-0ace4ce7ea00	requester	\N
357	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|40	\N	2023-03-06 12:47:28.936+07	74e03d35-8f37-4d70-b5b5-0ace4ce7ea00	admin	\N
358	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56548	110594523576593972208	\N	2023-03-06 12:51:08.256115+07	74e03d35-8f37-4d70-b5b5-0ace4ce7ea00	requester	\N
359	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|56548	\N	2023-03-06 14:40:15.046+07	8ac8787c-5c6b-4152-98e1-7cb6de1a2fd7	requester	\N
360	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|40	\N	2023-03-06 14:40:15.046+07	8ac8787c-5c6b-4152-98e1-7cb6de1a2fd7	admin	\N
361	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56548	108422352061899836997	\N	2023-03-06 14:41:40.406007+07	8ac8787c-5c6b-4152-98e1-7cb6de1a2fd7	requester	\N
362	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|58521	master|58521	\N	2023-03-06 14:49:15.849+07	c74af5ae-0037-472f-894e-b8e5e5e49829	requester	\N
363	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|58521	master|40	\N	2023-03-06 14:49:15.849+07	c74af5ae-0037-472f-894e-b8e5e5e49829	admin	\N
364	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|58521	pttpk|11678	\N	2023-03-06 14:55:33.628932+07	c74af5ae-0037-472f-894e-b8e5e5e49829	requester	\N
365	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|58521	pttpk|11678	\N	2023-03-06 15:00:16.790411+07	c74af5ae-0037-472f-894e-b8e5e5e49829	requester	\N
366	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|58521	master|40	\N	2023-03-06 15:00:16.793035+07	c74af5ae-0037-472f-894e-b8e5e5e49829	admin	\N
367	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|58521	master|58521	\N	2023-03-06 15:13:29.23+07	91545bd4-8982-479a-a687-9baba29c31c7	requester	\N
368	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|58521	master|40	\N	2023-03-06 15:13:29.23+07	91545bd4-8982-479a-a687-9baba29c31c7	admin	\N
369	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|58521	master|48655	\N	2023-03-06 15:16:59.345449+07	91545bd4-8982-479a-a687-9baba29c31c7	requester	\N
370	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|58521	master|48655	\N	2023-03-06 15:19:31.535312+07	91545bd4-8982-479a-a687-9baba29c31c7	requester	\N
371	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|58521	master|40	\N	2023-03-06 15:19:31.540912+07	91545bd4-8982-479a-a687-9baba29c31c7	admin	\N
373	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|40	\N	2023-03-07 05:05:41.225+07	48dcd28b-6f08-4173-a241-a628eaaed316	admin	\N
374	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	118113011408094583493	\N	2023-03-07 05:09:32.399518+07	48dcd28b-6f08-4173-a241-a628eaaed316	requester	\N
372	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2023-03-07 05:11:28.394+07	2023-03-07 05:05:41.225+07	48dcd28b-6f08-4173-a241-a628eaaed316	requester	\N
376	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|40	\N	2023-03-07 05:12:00.711+07	dd70db0a-82c8-4f9e-9bcb-8ad30c43ad9b	admin	\N
379	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	master|40	\N	2023-03-07 05:12:29.126161+07	dd70db0a-82c8-4f9e-9bcb-8ad30c43ad9b	admin	\N
375	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2023-03-07 05:15:58.428+07	2023-03-07 05:12:00.711+07	dd70db0a-82c8-4f9e-9bcb-8ad30c43ad9b	requester	\N
377	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	master|56543	2023-03-07 05:15:58.428+07	2023-03-07 05:12:12.063918+07	dd70db0a-82c8-4f9e-9bcb-8ad30c43ad9b	requester	\N
378	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	master|56543	2023-03-07 05:15:58.428+07	2023-03-07 05:12:29.124494+07	dd70db0a-82c8-4f9e-9bcb-8ad30c43ad9b	requester	\N
380	feedback	Feedback	Memberikan feedback	master|56543	master|56543	2023-03-07 05:15:58.428+07	2023-03-07 05:13:25.123573+07	dd70db0a-82c8-4f9e-9bcb-8ad30c43ad9b	agent	\N
381	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	110594523576593972208	\N	2023-03-07 09:21:35.437764+07	74e03d35-8f37-4d70-b5b5-0ace4ce7ea00	requester	\N
382	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	master|40	\N	2023-03-07 09:21:35.444503+07	74e03d35-8f37-4d70-b5b5-0ace4ce7ea00	admin	\N
383	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	108422352061899836997	\N	2023-03-07 09:22:34.708697+07	8ac8787c-5c6b-4152-98e1-7cb6de1a2fd7	requester	\N
384	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	master|40	\N	2023-03-07 09:22:34.713767+07	8ac8787c-5c6b-4152-98e1-7cb6de1a2fd7	admin	\N
385	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|56548	\N	2023-03-07 09:25:39.803+07	cbcd7b76-6daa-4827-aee2-ce0fcefa980a	requester	\N
386	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|40	\N	2023-03-07 09:25:39.803+07	cbcd7b76-6daa-4827-aee2-ce0fcefa980a	admin	\N
387	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56548	107320671397204374523	\N	2023-03-07 09:29:36.503253+07	cbcd7b76-6daa-4827-aee2-ce0fcefa980a	requester	\N
388	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	107320671397204374523	\N	2023-03-07 09:30:15.898993+07	cbcd7b76-6daa-4827-aee2-ce0fcefa980a	requester	\N
389	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	master|40	\N	2023-03-07 09:30:15.904613+07	cbcd7b76-6daa-4827-aee2-ce0fcefa980a	admin	\N
390	feedback	Feedback	Memberikan feedback	110594523576593972208	master|56548	\N	2023-03-07 09:40:20.104312+07	74e03d35-8f37-4d70-b5b5-0ace4ce7ea00	agent	\N
391	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-07 21:23:44.532+07	ca3c60f9-d7cc-4715-9598-ddcfa37a62a0	requester	\N
392	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-07 21:23:44.532+07	ca3c60f9-d7cc-4715-9598-ddcfa37a62a0	admin	\N
393	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	pttpk|3655	\N	2023-03-07 21:25:33.143646+07	ca3c60f9-d7cc-4715-9598-ddcfa37a62a0	requester	\N
394	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	118113011408094583493	\N	2023-03-07 23:30:46.885215+07	48dcd28b-6f08-4173-a241-a628eaaed316	requester	\N
395	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	master|40	\N	2023-03-07 23:30:46.887741+07	48dcd28b-6f08-4173-a241-a628eaaed316	admin	\N
396	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	pttpk|3655	\N	2023-03-08 08:39:51.127613+07	ca3c60f9-d7cc-4715-9598-ddcfa37a62a0	requester	\N
397	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-08 08:39:51.129808+07	ca3c60f9-d7cc-4715-9598-ddcfa37a62a0	admin	\N
398	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|56548	\N	2023-03-08 08:53:51.292+07	d0804aaf-eed8-4111-ad43-8a7a9bf8422b	requester	\N
399	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|40	\N	2023-03-08 08:53:51.292+07	d0804aaf-eed8-4111-ad43-8a7a9bf8422b	admin	\N
400	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56548	103830938037949554523	\N	2023-03-08 08:59:43.957493+07	d0804aaf-eed8-4111-ad43-8a7a9bf8422b	requester	\N
401	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-08 09:47:44.586+07	afe0c694-b8ff-4b8a-b896-d7f0b9bff6f7	requester	\N
402	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-08 09:47:44.586+07	afe0c694-b8ff-4b8a-b896-d7f0b9bff6f7	admin	\N
403	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	master|19431	\N	2023-03-08 09:49:16.167113+07	afe0c694-b8ff-4b8a-b896-d7f0b9bff6f7	requester	\N
404	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-08 19:38:19.421+07	148abb4a-ff0f-4ffb-9bff-362b7d01f1b3	requester	\N
405	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-08 19:38:19.421+07	148abb4a-ff0f-4ffb-9bff-362b7d01f1b3	admin	\N
406	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	100820938375550812284	\N	2023-03-08 19:41:53.949829+07	148abb4a-ff0f-4ffb-9bff-362b7d01f1b3	requester	\N
407	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-08 19:42:34.55+07	3774e439-f48d-465a-a8f0-a7827874ded9	requester	\N
408	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-08 19:42:34.55+07	3774e439-f48d-465a-a8f0-a7827874ded9	admin	\N
409	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	112930744005332427012	\N	2023-03-08 19:43:27.075224+07	3774e439-f48d-465a-a8f0-a7827874ded9	requester	\N
410	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-08 19:44:53.031+07	4d8e8632-ab34-45e0-860a-3b0aa5c31de7	requester	\N
411	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-08 19:44:53.031+07	4d8e8632-ab34-45e0-860a-3b0aa5c31de7	admin	\N
412	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	101142547976358374810	\N	2023-03-08 19:45:12.098646+07	4d8e8632-ab34-45e0-860a-3b0aa5c31de7	requester	\N
413	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-08 19:45:31.55+07	67bfa502-7631-4811-85a0-fd8462aee3b8	requester	\N
414	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-08 19:45:31.55+07	67bfa502-7631-4811-85a0-fd8462aee3b8	admin	\N
416	chats_customer_to_agent	Komentar	Mengomentari tiket anda	109993441263825023282	master|40	\N	2023-03-08 20:23:23.692598+07	67bfa502-7631-4811-85a0-fd8462aee3b8	agent	\N
418	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|40	\N	2023-03-09 06:02:18.026+07	7a7d8965-7484-4fe1-b2f5-cb102ec8d92a	admin	\N
419	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	master|19431	\N	2023-03-09 06:08:00.070709+07	7a7d8965-7484-4fe1-b2f5-cb102ec8d92a	requester	\N
417	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2023-03-09 06:08:09.706+07	2023-03-09 06:02:18.026+07	7a7d8965-7484-4fe1-b2f5-cb102ec8d92a	requester	\N
415	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	109993441263825023282	2023-03-09 08:21:34.995+07	2023-03-08 19:45:52.009622+07	67bfa502-7631-4811-85a0-fd8462aee3b8	requester	\N
420	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-09 14:13:21.021+07	6239be5a-bae8-42f3-8ef6-5ca9af20874d	requester	\N
421	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-09 14:13:21.021+07	6239be5a-bae8-42f3-8ef6-5ca9af20874d	admin	\N
422	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	111128017015886258179	\N	2023-03-09 14:14:34.488693+07	6239be5a-bae8-42f3-8ef6-5ca9af20874d	requester	\N
423	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|19431	\N	2023-03-09 14:15:32.047258+07	afe0c694-b8ff-4b8a-b896-d7f0b9bff6f7	requester	\N
424	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-09 14:15:32.052217+07	afe0c694-b8ff-4b8a-b896-d7f0b9bff6f7	admin	\N
425	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	100820938375550812284	\N	2023-03-09 14:15:47.557156+07	148abb4a-ff0f-4ffb-9bff-362b7d01f1b3	requester	\N
426	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-09 14:15:47.559637+07	148abb4a-ff0f-4ffb-9bff-362b7d01f1b3	admin	\N
427	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	112930744005332427012	\N	2023-03-09 14:15:56.169179+07	3774e439-f48d-465a-a8f0-a7827874ded9	requester	\N
428	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-09 14:15:56.171093+07	3774e439-f48d-465a-a8f0-a7827874ded9	admin	\N
429	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	101142547976358374810	\N	2023-03-09 14:16:04.292929+07	4d8e8632-ab34-45e0-860a-3b0aa5c31de7	requester	\N
430	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-09 14:16:04.294621+07	4d8e8632-ab34-45e0-860a-3b0aa5c31de7	admin	\N
432	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-09 14:16:15.571679+07	67bfa502-7631-4811-85a0-fd8462aee3b8	admin	\N
433	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	master|19431	\N	2023-03-09 15:08:28.336055+07	7a7d8965-7484-4fe1-b2f5-cb102ec8d92a	requester	\N
434	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	master|40	\N	2023-03-09 15:08:28.339005+07	7a7d8965-7484-4fe1-b2f5-cb102ec8d92a	admin	\N
435	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-09 16:24:07.527+07	9ba97736-6c05-480e-8099-1bfc60554a34	requester	\N
436	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-09 16:24:07.527+07	9ba97736-6c05-480e-8099-1bfc60554a34	admin	\N
437	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	113590622065689285619	\N	2023-03-09 16:24:19.088092+07	9ba97736-6c05-480e-8099-1bfc60554a34	requester	\N
438	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	113590622065689285619	\N	2023-03-09 16:25:28.725337+07	9ba97736-6c05-480e-8099-1bfc60554a34	requester	\N
439	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-09 16:25:28.729564+07	9ba97736-6c05-480e-8099-1bfc60554a34	admin	\N
440	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	111128017015886258179	\N	2023-03-09 16:25:58.109145+07	6239be5a-bae8-42f3-8ef6-5ca9af20874d	requester	\N
441	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-09 16:25:58.110606+07	6239be5a-bae8-42f3-8ef6-5ca9af20874d	admin	\N
442	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56553	master|56553	\N	2023-03-09 18:20:20.618+07	7d3628c8-999f-4312-9b3e-5889aeb4b163	requester	\N
443	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56553	master|40	\N	2023-03-09 18:20:20.618+07	7d3628c8-999f-4312-9b3e-5889aeb4b163	admin	\N
444	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56553	105126464846449076179	\N	2023-03-09 18:30:57.949104+07	7d3628c8-999f-4312-9b3e-5889aeb4b163	requester	\N
431	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	109993441263825023282	2023-03-10 06:56:46.329+07	2023-03-09 14:16:15.570063+07	67bfa502-7631-4811-85a0-fd8462aee3b8	requester	\N
446	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|88	master|40	\N	2023-03-10 09:59:13.851+07	8b148afe-07d2-40c9-92bc-674b04106a5b	admin	\N
448	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|88	master|40	\N	2023-03-10 10:00:01.352157+07	8b148afe-07d2-40c9-92bc-674b04106a5b	admin	\N
447	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|88	109993441263825023282	2023-03-10 10:07:59.159+07	2023-03-10 10:00:01.346786+07	8b148afe-07d2-40c9-92bc-674b04106a5b	requester	\N
449	chats_customer_to_agent	Komentar	Mengomentari tiket anda	105126464846449076179	master|56553	\N	2023-03-10 15:27:15.271987+07	7d3628c8-999f-4312-9b3e-5889aeb4b163	agent	\N
450	feedback	Feedback	Memberikan feedback	master|19431	master|56543	2023-03-11 08:06:55.906+07	2023-03-10 22:25:33.511302+07	7a7d8965-7484-4fe1-b2f5-cb102ec8d92a	agent	\N
451	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|49741	master|49741	\N	2023-03-15 09:20:05.216+07	51e8c056-0de2-4ead-b72b-d0d04c3beb11	requester	\N
454	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|40	\N	2023-03-15 09:20:10.292+07	310aabc8-0177-4c8c-b3de-58a056a228a9	admin	\N
455	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	100898213862692765791	\N	2023-03-15 09:22:22.714781+07	310aabc8-0177-4c8c-b3de-58a056a228a9	requester	\N
457	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|88	master|40	\N	2023-03-15 09:38:38.621+07	3b12d29e-ce1a-4fb8-9548-6bb7fbb89c75	admin	\N
458	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|88	100154973142512312770	\N	2023-03-15 09:41:36.081925+07	3b12d29e-ce1a-4fb8-9548-6bb7fbb89c75	requester	\N
459	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|88	100154973142512312770	\N	2023-03-15 09:45:43.299513+07	3b12d29e-ce1a-4fb8-9548-6bb7fbb89c75	requester	\N
460	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|88	master|40	\N	2023-03-15 09:45:43.301704+07	3b12d29e-ce1a-4fb8-9548-6bb7fbb89c75	admin	\N
445	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|88	master|88	2023-03-15 09:49:07.441+07	2023-03-10 09:59:13.851+07	8b148afe-07d2-40c9-92bc-674b04106a5b	requester	\N
456	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|88	master|88	2023-03-15 09:49:07.441+07	2023-03-15 09:38:38.621+07	3b12d29e-ce1a-4fb8-9548-6bb7fbb89c75	requester	\N
463	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	master|88	2023-03-15 09:49:07.441+07	2023-03-15 09:47:04.766893+07	7296931e-869c-4c2d-94d8-b06d27f0f8c2	requester	\N
465	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	master|88	2023-03-15 09:49:07.441+07	2023-03-15 09:47:24.085639+07	7296931e-869c-4c2d-94d8-b06d27f0f8c2	requester	\N
452	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|49741	master|56543	2023-03-15 16:32:16.451+07	2023-03-15 09:20:05.216+07	51e8c056-0de2-4ead-b72b-d0d04c3beb11	admin	\N
453	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2023-03-15 16:32:16.451+07	2023-03-15 09:20:10.292+07	310aabc8-0177-4c8c-b3de-58a056a228a9	requester	\N
461	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2023-03-15 16:32:16.451+07	2023-03-15 09:46:52.895+07	7296931e-869c-4c2d-94d8-b06d27f0f8c2	requester	\N
462	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2023-03-15 16:32:16.451+07	2023-03-15 09:46:52.895+07	7296931e-869c-4c2d-94d8-b06d27f0f8c2	admin	\N
464	chats_customer_to_agent	Komentar	Mengomentari tiket anda	master|88	master|56543	2023-03-15 16:32:16.451+07	2023-03-15 09:47:15.03159+07	7296931e-869c-4c2d-94d8-b06d27f0f8c2	agent	\N
466	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	master|56543	2023-03-15 16:32:16.451+07	2023-03-15 09:47:24.087221+07	7296931e-869c-4c2d-94d8-b06d27f0f8c2	admin	\N
467	feedback	Feedback	Memberikan feedback	master|88	master|56543	2023-03-15 16:32:16.451+07	2023-03-15 09:48:11.500936+07	7296931e-869c-4c2d-94d8-b06d27f0f8c2	agent	\N
470	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56543	110303135123066864005	\N	2023-03-16 13:13:03.764285+07	8205714d-18b5-40bd-a1d2-baef0c6a6c17	requester	\N
468	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2023-03-16 13:14:15.845+07	2023-03-16 13:08:05.781+07	8205714d-18b5-40bd-a1d2-baef0c6a6c17	requester	\N
469	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56543	master|56543	2023-03-16 13:14:15.845+07	2023-03-16 13:08:05.781+07	8205714d-18b5-40bd-a1d2-baef0c6a6c17	admin	\N
471	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|56548	\N	2023-03-17 08:48:42.834+07	9c8ee129-5a6f-4f42-a877-24ac49c19578	requester	\N
472	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|40	\N	2023-03-17 08:48:42.834+07	9c8ee129-5a6f-4f42-a877-24ac49c19578	admin	\N
473	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56548	109485237600040517247	\N	2023-03-17 08:50:40.992079+07	9c8ee129-5a6f-4f42-a877-24ac49c19578	requester	\N
474	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	109485237600040517247	\N	2023-03-17 08:51:23.516201+07	9c8ee129-5a6f-4f42-a877-24ac49c19578	requester	\N
475	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	master|40	\N	2023-03-17 08:51:23.517891+07	9c8ee129-5a6f-4f42-a877-24ac49c19578	admin	\N
476	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	103830938037949554523	\N	2023-03-17 08:52:14.846477+07	d0804aaf-eed8-4111-ad43-8a7a9bf8422b	requester	\N
477	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	master|40	\N	2023-03-17 08:52:14.851407+07	d0804aaf-eed8-4111-ad43-8a7a9bf8422b	admin	\N
478	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|56548	\N	2023-03-17 08:55:08.41+07	a8cedb92-5b54-4f6d-8da2-506222c2d6e9	requester	\N
480	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56548	master|34625	\N	2023-03-17 08:57:18.012979+07	a8cedb92-5b54-4f6d-8da2-506222c2d6e9	requester	\N
481	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	master|34625	\N	2023-03-17 08:57:39.29741+07	a8cedb92-5b54-4f6d-8da2-506222c2d6e9	requester	\N
483	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|56548	\N	2023-03-17 08:58:27.688+07	f66debb2-d835-4bdf-882f-b4d1c1519335	requester	\N
485	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56548	106221904072757493129	\N	2023-03-17 09:00:09.049636+07	f66debb2-d835-4bdf-882f-b4d1c1519335	requester	\N
486	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	106221904072757493129	\N	2023-03-17 09:00:40.583609+07	f66debb2-d835-4bdf-882f-b4d1c1519335	requester	\N
488	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|56548	\N	2023-03-17 09:04:28.731+07	6ae61b89-c4f8-4767-8d57-a67c8f61116c	requester	\N
489	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|40	\N	2023-03-17 09:04:28.731+07	6ae61b89-c4f8-4767-8d57-a67c8f61116c	admin	\N
490	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56548	108063347615393395047	\N	2023-03-17 09:08:22.632678+07	6ae61b89-c4f8-4767-8d57-a67c8f61116c	requester	\N
491	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	108063347615393395047	\N	2023-03-17 09:09:11.772679+07	6ae61b89-c4f8-4767-8d57-a67c8f61116c	requester	\N
492	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	master|40	\N	2023-03-17 09:09:11.777389+07	6ae61b89-c4f8-4767-8d57-a67c8f61116c	admin	\N
493	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|56548	\N	2023-03-17 09:09:37.966+07	fb9d5b01-ee7f-4f0c-906a-9300792a51a6	requester	\N
494	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|40	\N	2023-03-17 09:09:37.966+07	fb9d5b01-ee7f-4f0c-906a-9300792a51a6	admin	\N
495	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56548	112226202854798199276	\N	2023-03-17 09:11:34.032713+07	fb9d5b01-ee7f-4f0c-906a-9300792a51a6	requester	\N
496	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	112226202854798199276	\N	2023-03-17 09:12:25.07871+07	fb9d5b01-ee7f-4f0c-906a-9300792a51a6	requester	\N
497	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	master|40	\N	2023-03-17 09:12:25.083792+07	fb9d5b01-ee7f-4f0c-906a-9300792a51a6	admin	\N
498	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|56548	\N	2023-03-17 09:13:44.578+07	4b0cf16b-4ba7-4ab5-9319-7d3904ffb336	requester	\N
499	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|40	\N	2023-03-17 09:13:44.578+07	4b0cf16b-4ba7-4ab5-9319-7d3904ffb336	admin	\N
500	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56548	master|57561	\N	2023-03-17 09:15:21.505327+07	4b0cf16b-4ba7-4ab5-9319-7d3904ffb336	requester	\N
501	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	master|57561	\N	2023-03-17 09:16:10.846808+07	4b0cf16b-4ba7-4ab5-9319-7d3904ffb336	requester	\N
502	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	master|40	\N	2023-03-17 09:16:10.851782+07	4b0cf16b-4ba7-4ab5-9319-7d3904ffb336	admin	\N
503	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|56548	\N	2023-03-17 09:16:30.642+07	86d183bd-a333-4bcc-b929-16197c6f4093	requester	\N
504	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|40	\N	2023-03-17 09:16:30.642+07	86d183bd-a333-4bcc-b929-16197c6f4093	admin	\N
505	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56548	116884065911676631095	\N	2023-03-17 09:18:46.666405+07	86d183bd-a333-4bcc-b929-16197c6f4093	requester	\N
506	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	116884065911676631095	\N	2023-03-17 09:19:20.119056+07	86d183bd-a333-4bcc-b929-16197c6f4093	requester	\N
507	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	master|40	\N	2023-03-17 09:19:20.123697+07	86d183bd-a333-4bcc-b929-16197c6f4093	admin	\N
508	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|56548	\N	2023-03-17 09:19:32.284+07	6e169dcd-ec24-45d4-9e0e-b94fa4f3865d	requester	\N
509	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|40	\N	2023-03-17 09:19:32.284+07	6e169dcd-ec24-45d4-9e0e-b94fa4f3865d	admin	\N
510	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56548	102394307718819695325	\N	2023-03-17 09:20:32.570819+07	6e169dcd-ec24-45d4-9e0e-b94fa4f3865d	requester	\N
511	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	102394307718819695325	\N	2023-03-17 09:20:38.229656+07	6e169dcd-ec24-45d4-9e0e-b94fa4f3865d	requester	\N
512	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	master|40	\N	2023-03-17 09:20:38.234095+07	6e169dcd-ec24-45d4-9e0e-b94fa4f3865d	admin	\N
513	chats_customer_to_agent	Komentar	Mengomentari tiket anda	104052548613068363671	master|49741	\N	2023-03-17 09:39:35.491051+07	51e8c056-0de2-4ead-b72b-d0d04c3beb11	agent	\N
514	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|58521	master|58521	\N	2023-03-17 12:40:45.578+07	ad827c59-3c04-48b5-9881-8190ece7463e	requester	\N
515	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|58521	master|40	\N	2023-03-17 12:40:45.578+07	ad827c59-3c04-48b5-9881-8190ece7463e	admin	\N
516	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56553	105126464846449076179	\N	2023-03-17 12:41:42.983276+07	7d3628c8-999f-4312-9b3e-5889aeb4b163	requester	\N
517	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56553	master|40	\N	2023-03-17 12:41:42.985677+07	7d3628c8-999f-4312-9b3e-5889aeb4b163	admin	\N
518	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56553	master|56553	\N	2023-03-17 12:42:30.959+07	6d9dcd44-69e6-4228-94ee-671f1e309247	requester	\N
519	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56553	master|40	\N	2023-03-17 12:42:30.959+07	6d9dcd44-69e6-4228-94ee-671f1e309247	admin	\N
520	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|58521	104188047376455869619	\N	2023-03-17 12:43:17.479616+07	ad827c59-3c04-48b5-9881-8190ece7463e	requester	\N
521	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56553	111613221740802737569	\N	2023-03-17 12:44:13.301016+07	6d9dcd44-69e6-4228-94ee-671f1e309247	requester	\N
522	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|58521	master|56814	\N	2023-03-17 12:44:56.339611+07	33d0a4da-5ad9-4c2e-b0be-93c89673560a	requester	\N
523	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|58521	master|58521	\N	2023-03-17 12:45:20.429+07	33d0a4da-5ad9-4c2e-b0be-93c89673560a	requester	\N
524	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|58521	master|40	\N	2023-03-17 12:45:20.429+07	33d0a4da-5ad9-4c2e-b0be-93c89673560a	admin	\N
525	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|58521	master|56814	\N	2023-03-17 12:45:31.151765+07	33d0a4da-5ad9-4c2e-b0be-93c89673560a	requester	\N
526	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56553	master|56553	\N	2023-03-17 12:45:41.633+07	cd2a9f72-4b17-40b4-9aa9-a3aed6c71ae3	requester	\N
527	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56553	master|40	\N	2023-03-17 12:45:41.633+07	cd2a9f72-4b17-40b4-9aa9-a3aed6c71ae3	admin	\N
528	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|58521	master|56814	\N	2023-03-17 12:45:55.04778+07	33d0a4da-5ad9-4c2e-b0be-93c89673560a	requester	\N
529	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|58521	master|40	\N	2023-03-17 12:45:55.049558+07	33d0a4da-5ad9-4c2e-b0be-93c89673560a	admin	\N
530	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56553	114271680703150740327	\N	2023-03-17 12:47:17.584963+07	cd2a9f72-4b17-40b4-9aa9-a3aed6c71ae3	requester	\N
531	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|58521	master|58521	\N	2023-03-17 12:52:36.538+07	092689ec-bede-4f57-b064-8ea8a8a5fa8e	requester	\N
532	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|58521	master|40	\N	2023-03-17 12:52:36.538+07	092689ec-bede-4f57-b064-8ea8a8a5fa8e	admin	\N
479	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|56543	2023-03-17 19:45:58.843+07	2023-03-17 08:55:08.41+07	a8cedb92-5b54-4f6d-8da2-506222c2d6e9	admin	\N
482	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	master|56543	2023-03-17 19:45:58.843+07	2023-03-17 08:57:39.299194+07	a8cedb92-5b54-4f6d-8da2-506222c2d6e9	admin	\N
484	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|56543	2023-03-17 19:45:58.843+07	2023-03-17 08:58:27.688+07	f66debb2-d835-4bdf-882f-b4d1c1519335	admin	\N
487	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	master|56543	2023-03-17 19:45:58.843+07	2023-03-17 09:00:40.586885+07	f66debb2-d835-4bdf-882f-b4d1c1519335	admin	\N
533	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|88	master|88	\N	2023-03-17 20:48:38.47+07	56c68b7c-4147-4a39-8a28-6d746f3d3b1e	requester	\N
534	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|88	master|40	\N	2023-03-17 20:48:38.47+07	56c68b7c-4147-4a39-8a28-6d746f3d3b1e	admin	\N
535	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|88	113567613428615339336	\N	2023-03-17 20:50:49.611626+07	56c68b7c-4147-4a39-8a28-6d746f3d3b1e	requester	\N
536	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|88	master|88	\N	2023-03-17 20:58:10.827+07	9c88fcbf-23a0-47a3-bfa3-1f520a8380a7	requester	\N
537	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|88	master|40	\N	2023-03-17 20:58:10.827+07	9c88fcbf-23a0-47a3-bfa3-1f520a8380a7	admin	\N
538	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|88	master|88	\N	2023-03-17 20:58:40.068+07	86c86e49-4394-4450-ae42-9b9be7df1090	requester	\N
539	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|88	master|40	\N	2023-03-17 20:58:40.068+07	86c86e49-4394-4450-ae42-9b9be7df1090	admin	\N
540	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|88	111621747819290560388	\N	2023-03-17 20:59:34.271304+07	86c86e49-4394-4450-ae42-9b9be7df1090	requester	\N
541	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-18 06:24:52.146+07	3435d1f6-195c-4be4-8799-05528090671d	requester	\N
542	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-18 06:24:52.146+07	3435d1f6-195c-4be4-8799-05528090671d	admin	\N
543	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	106421360554716345525	\N	2023-03-18 06:27:36.518824+07	3435d1f6-195c-4be4-8799-05528090671d	requester	\N
544	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	106421360554716345525	\N	2023-03-18 06:28:15.51769+07	3435d1f6-195c-4be4-8799-05528090671d	requester	\N
545	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-18 06:28:15.520071+07	3435d1f6-195c-4be4-8799-05528090671d	admin	\N
546	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-18 06:28:42.957+07	7590641b-e743-414e-b232-d80524fda2d5	requester	\N
547	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-18 06:28:42.957+07	7590641b-e743-414e-b232-d80524fda2d5	admin	\N
548	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	111511155205878625323	\N	2023-03-18 06:44:59.497564+07	7590641b-e743-414e-b232-d80524fda2d5	requester	\N
549	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	111511155205878625323	\N	2023-03-18 06:45:34.802956+07	7590641b-e743-414e-b232-d80524fda2d5	requester	\N
550	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-18 06:45:34.80516+07	7590641b-e743-414e-b232-d80524fda2d5	admin	\N
551	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56553	master|56553	\N	2023-03-20 14:13:44.158+07	0173d681-6f30-48f4-8aff-737116bdfa02	requester	\N
552	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56553	master|40	\N	2023-03-20 14:13:44.158+07	0173d681-6f30-48f4-8aff-737116bdfa02	admin	\N
553	feedback	Feedback	Memberikan feedback	106221904072757493129	master|56548	\N	2023-03-20 14:23:11.115506+07	f66debb2-d835-4bdf-882f-b4d1c1519335	agent	\N
554	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56553	master|62077	\N	2023-03-20 14:28:01.367403+07	0173d681-6f30-48f4-8aff-737116bdfa02	requester	\N
555	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-20 17:30:10.802+07	7a1cb5d3-82f4-4c56-ae6f-ddebdc4fd4b5	requester	\N
556	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-20 17:30:10.802+07	7a1cb5d3-82f4-4c56-ae6f-ddebdc4fd4b5	admin	\N
557	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	114071498507663116224	\N	2023-03-20 17:31:22.896367+07	7a1cb5d3-82f4-4c56-ae6f-ddebdc4fd4b5	requester	\N
558	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	114071498507663116224	\N	2023-03-20 17:31:56.399422+07	7a1cb5d3-82f4-4c56-ae6f-ddebdc4fd4b5	requester	\N
559	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-20 17:31:56.40168+07	7a1cb5d3-82f4-4c56-ae6f-ddebdc4fd4b5	admin	\N
560	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|56548	\N	2023-03-21 08:53:13.628+07	20c77117-1d82-49d3-ac5c-ef6798b47620	requester	\N
561	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|40	\N	2023-03-21 08:53:13.628+07	20c77117-1d82-49d3-ac5c-ef6798b47620	admin	\N
562	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56548	115336653648009478118	\N	2023-03-21 08:55:29.421206+07	20c77117-1d82-49d3-ac5c-ef6798b47620	requester	\N
563	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	115336653648009478118	\N	2023-03-21 08:56:13.153288+07	20c77117-1d82-49d3-ac5c-ef6798b47620	requester	\N
564	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	master|40	\N	2023-03-21 08:56:13.156048+07	20c77117-1d82-49d3-ac5c-ef6798b47620	admin	\N
565	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|56548	\N	2023-03-21 08:56:26.105+07	46ea028b-2f65-4fe2-a748-ac6a25252180	requester	\N
566	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|40	\N	2023-03-21 08:56:26.105+07	46ea028b-2f65-4fe2-a748-ac6a25252180	admin	\N
567	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56548	114189413630166937544	\N	2023-03-21 08:58:16.007147+07	46ea028b-2f65-4fe2-a748-ac6a25252180	requester	\N
568	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	114189413630166937544	\N	2023-03-21 08:58:44.214559+07	46ea028b-2f65-4fe2-a748-ac6a25252180	requester	\N
569	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	master|40	\N	2023-03-21 08:58:44.216474+07	46ea028b-2f65-4fe2-a748-ac6a25252180	admin	\N
570	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56545	master|56545	\N	2023-03-21 10:14:43.663+07	9822009c-a4da-4787-bdcd-27c742c83307	requester	\N
571	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56545	master|40	\N	2023-03-21 10:14:43.663+07	9822009c-a4da-4787-bdcd-27c742c83307	admin	\N
572	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56545	master|4057	\N	2023-03-21 16:29:57.691366+07	9822009c-a4da-4787-bdcd-27c742c83307	requester	\N
573	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56553	master|56553	\N	2023-03-21 16:30:26.214+07	89f8231e-251a-4bfb-9079-5bde4a3983d8	requester	\N
574	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56553	master|40	\N	2023-03-21 16:30:26.214+07	89f8231e-251a-4bfb-9079-5bde4a3983d8	admin	\N
575	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56545	master|4057	\N	2023-03-21 16:31:01.706811+07	9822009c-a4da-4787-bdcd-27c742c83307	requester	\N
576	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56545	master|40	\N	2023-03-21 16:31:01.70826+07	9822009c-a4da-4787-bdcd-27c742c83307	admin	\N
577	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56545	master|56545	\N	2023-03-21 16:32:02.387+07	28a60737-2df7-45ab-8888-7aa44c643d67	requester	\N
578	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56545	master|40	\N	2023-03-21 16:32:02.387+07	28a60737-2df7-45ab-8888-7aa44c643d67	admin	\N
579	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56545	105622302617721260523	\N	2023-03-21 16:33:13.25866+07	28a60737-2df7-45ab-8888-7aa44c643d67	requester	\N
580	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56545	105622302617721260523	\N	2023-03-21 16:33:41.372774+07	28a60737-2df7-45ab-8888-7aa44c643d67	requester	\N
581	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56545	master|40	\N	2023-03-21 16:33:41.374321+07	28a60737-2df7-45ab-8888-7aa44c643d67	admin	\N
582	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56553	master|61550	\N	2023-03-21 16:33:49.952442+07	89f8231e-251a-4bfb-9079-5bde4a3983d8	requester	\N
583	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56553	master|56553	\N	2023-03-21 16:37:29.375+07	47f7f626-db64-4744-ba1e-13a260e93401	requester	\N
584	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56553	master|40	\N	2023-03-21 16:37:29.375+07	47f7f626-db64-4744-ba1e-13a260e93401	admin	\N
585	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56553	108629014816953516277	\N	2023-03-21 16:42:00.643588+07	47f7f626-db64-4744-ba1e-13a260e93401	requester	\N
586	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56553	114271680703150740327	\N	2023-03-21 16:43:08.362567+07	cd2a9f72-4b17-40b4-9aa9-a3aed6c71ae3	requester	\N
587	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56553	master|40	\N	2023-03-21 16:43:08.364252+07	cd2a9f72-4b17-40b4-9aa9-a3aed6c71ae3	admin	\N
588	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56545	master|56545	\N	2023-03-21 16:46:14.141+07	ae07d885-ea09-49a5-806c-46661c2991f6	requester	\N
589	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56545	master|40	\N	2023-03-21 16:46:14.141+07	ae07d885-ea09-49a5-806c-46661c2991f6	admin	\N
590	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56545	master|58318	\N	2023-03-21 16:47:18.009436+07	ae07d885-ea09-49a5-806c-46661c2991f6	requester	\N
591	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56545	master|58318	\N	2023-03-21 16:47:36.263958+07	ae07d885-ea09-49a5-806c-46661c2991f6	requester	\N
592	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56545	master|40	\N	2023-03-21 16:47:36.265645+07	ae07d885-ea09-49a5-806c-46661c2991f6	admin	\N
593	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56553	master|62077	\N	2023-03-21 16:47:47.432928+07	0173d681-6f30-48f4-8aff-737116bdfa02	requester	\N
594	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56553	master|40	\N	2023-03-21 16:47:47.434826+07	0173d681-6f30-48f4-8aff-737116bdfa02	admin	\N
595	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56553	111613221740802737569	\N	2023-03-21 16:49:13.685495+07	6d9dcd44-69e6-4228-94ee-671f1e309247	requester	\N
596	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56553	master|40	\N	2023-03-21 16:49:13.687722+07	6d9dcd44-69e6-4228-94ee-671f1e309247	admin	\N
597	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56553	108629014816953516277	\N	2023-03-21 16:53:02.196903+07	47f7f626-db64-4744-ba1e-13a260e93401	requester	\N
598	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56553	108629014816953516277	\N	2023-03-21 16:55:32.250409+07	47f7f626-db64-4744-ba1e-13a260e93401	requester	\N
599	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56553	master|40	\N	2023-03-21 16:55:32.252567+07	47f7f626-db64-4744-ba1e-13a260e93401	admin	\N
600	feedback	Feedback	Memberikan feedback	108629014816953516277	master|56553	\N	2023-03-21 18:37:40.903103+07	47f7f626-db64-4744-ba1e-13a260e93401	agent	\N
601	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	110303135123066864005	\N	2023-03-22 22:18:38.00895+07	8205714d-18b5-40bd-a1d2-baef0c6a6c17	requester	\N
602	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56543	master|56543	2023-03-23 07:55:46.355+07	2023-03-22 22:18:38.011216+07	8205714d-18b5-40bd-a1d2-baef0c6a6c17	admin	\N
603	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|56548	\N	2023-03-24 15:25:50.592+07	ca39b655-b477-4898-a604-1531f8d38cef	requester	\N
604	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|40	\N	2023-03-24 15:25:50.592+07	ca39b655-b477-4898-a604-1531f8d38cef	admin	\N
605	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56548	106221904072757493129	\N	2023-03-24 15:27:58.366882+07	ca39b655-b477-4898-a604-1531f8d38cef	requester	\N
606	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	106221904072757493129	\N	2023-03-24 15:28:18.044861+07	ca39b655-b477-4898-a604-1531f8d38cef	requester	\N
607	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	master|40	\N	2023-03-24 15:28:18.050108+07	ca39b655-b477-4898-a604-1531f8d38cef	admin	\N
608	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|56548	\N	2023-03-24 15:29:32.075+07	930318bf-0629-4c13-9afe-dd25b1359463	requester	\N
609	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|40	\N	2023-03-24 15:29:32.075+07	930318bf-0629-4c13-9afe-dd25b1359463	admin	\N
610	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56548	103059080006583136498	\N	2023-03-24 15:31:24.444787+07	930318bf-0629-4c13-9afe-dd25b1359463	requester	\N
611	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	103059080006583136498	\N	2023-03-24 15:31:40.269356+07	930318bf-0629-4c13-9afe-dd25b1359463	requester	\N
612	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	master|40	\N	2023-03-24 15:31:40.271592+07	930318bf-0629-4c13-9afe-dd25b1359463	admin	\N
613	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|56548	\N	2023-03-24 15:34:46.509+07	608ed4c0-39f3-4e32-9705-8c319dec2652	requester	\N
614	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|40	\N	2023-03-24 15:34:46.509+07	608ed4c0-39f3-4e32-9705-8c319dec2652	admin	\N
615	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56548	115382242955323579661	\N	2023-03-24 15:37:05.715021+07	608ed4c0-39f3-4e32-9705-8c319dec2652	requester	\N
616	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	115382242955323579661	\N	2023-03-24 15:37:58.024324+07	608ed4c0-39f3-4e32-9705-8c319dec2652	requester	\N
617	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	master|40	\N	2023-03-24 15:37:58.02656+07	608ed4c0-39f3-4e32-9705-8c319dec2652	admin	\N
618	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|56548	\N	2023-03-24 15:45:15.666+07	6dd268f6-4240-4d90-9145-83ed03ec9443	requester	\N
619	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|40	\N	2023-03-24 15:45:15.666+07	6dd268f6-4240-4d90-9145-83ed03ec9443	admin	\N
620	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56548	103607405887123196492	\N	2023-03-24 15:48:30.732877+07	6dd268f6-4240-4d90-9145-83ed03ec9443	requester	\N
621	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	103607405887123196492	\N	2023-03-24 15:48:44.774818+07	6dd268f6-4240-4d90-9145-83ed03ec9443	requester	\N
622	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	master|40	\N	2023-03-24 15:48:44.77641+07	6dd268f6-4240-4d90-9145-83ed03ec9443	admin	\N
623	feedback	Feedback	Memberikan feedback	master|4057	master|56545	\N	2023-03-26 21:23:05.467681+07	9822009c-a4da-4787-bdcd-27c742c83307	agent	\N
624	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-26 22:42:14.441+07	af3d64bc-18f1-49f6-87c4-9330c1287591	requester	\N
625	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|40	master|40	\N	2023-03-26 22:42:14.441+07	af3d64bc-18f1-49f6-87c4-9330c1287591	admin	\N
626	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|40	101182176522172754394	\N	2023-03-26 22:45:24.921515+07	af3d64bc-18f1-49f6-87c4-9330c1287591	requester	\N
627	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	101182176522172754394	\N	2023-03-26 22:46:20.463777+07	af3d64bc-18f1-49f6-87c4-9330c1287591	requester	\N
628	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|40	master|40	\N	2023-03-26 22:46:20.466059+07	af3d64bc-18f1-49f6-87c4-9330c1287591	admin	\N
629	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|56548	\N	2023-03-27 09:15:50.287+07	45963a60-ebf3-4b75-9a78-6aa164467970	requester	\N
630	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|40	\N	2023-03-27 09:15:50.287+07	45963a60-ebf3-4b75-9a78-6aa164467970	admin	\N
631	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56548	112263634041057016989	\N	2023-03-27 09:28:07.561691+07	45963a60-ebf3-4b75-9a78-6aa164467970	requester	\N
632	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	112263634041057016989	\N	2023-03-27 09:28:32.671888+07	45963a60-ebf3-4b75-9a78-6aa164467970	requester	\N
633	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	master|40	\N	2023-03-27 09:28:32.67518+07	45963a60-ebf3-4b75-9a78-6aa164467970	admin	\N
634	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|56548	\N	2023-03-27 09:30:29.312+07	a810fcbb-c7b2-4887-bb4f-221eafdd15e4	requester	\N
635	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|40	\N	2023-03-27 09:30:29.312+07	a810fcbb-c7b2-4887-bb4f-221eafdd15e4	admin	\N
636	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56548	103059080006583136498	\N	2023-03-27 09:30:38.844112+07	a810fcbb-c7b2-4887-bb4f-221eafdd15e4	requester	\N
637	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	103059080006583136498	\N	2023-03-27 09:30:50.707246+07	a810fcbb-c7b2-4887-bb4f-221eafdd15e4	requester	\N
638	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	master|40	\N	2023-03-27 09:30:50.708684+07	a810fcbb-c7b2-4887-bb4f-221eafdd15e4	admin	\N
639	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56548	100924312039026485175	\N	2023-03-27 09:34:53.869731+07	65722874-83ac-435b-b0e1-11334c9ba60f	requester	\N
640	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|56548	\N	2023-03-27 09:35:13.511+07	65722874-83ac-435b-b0e1-11334c9ba60f	requester	\N
641	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|40	\N	2023-03-27 09:35:13.511+07	65722874-83ac-435b-b0e1-11334c9ba60f	admin	\N
642	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	100924312039026485175	\N	2023-03-27 09:35:32.866264+07	65722874-83ac-435b-b0e1-11334c9ba60f	requester	\N
643	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	master|40	\N	2023-03-27 09:35:32.868206+07	65722874-83ac-435b-b0e1-11334c9ba60f	admin	\N
644	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56548	master|61648	\N	2023-03-27 09:41:30.050466+07	92b84a7a-776b-43db-b853-e2f1a946aece	requester	\N
645	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|56548	\N	2023-03-27 09:41:34.734+07	92b84a7a-776b-43db-b853-e2f1a946aece	requester	\N
646	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|40	\N	2023-03-27 09:41:34.734+07	92b84a7a-776b-43db-b853-e2f1a946aece	admin	\N
647	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	master|61648	\N	2023-03-27 09:41:44.952542+07	92b84a7a-776b-43db-b853-e2f1a946aece	requester	\N
648	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	master|40	\N	2023-03-27 09:41:44.95408+07	92b84a7a-776b-43db-b853-e2f1a946aece	admin	\N
649	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56548	master|33634	\N	2023-03-27 10:12:38.714557+07	83804d69-6aee-4e08-90fd-3690f7176671	requester	\N
650	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|56548	\N	2023-03-27 10:12:43.319+07	83804d69-6aee-4e08-90fd-3690f7176671	requester	\N
651	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56548	master|40	\N	2023-03-27 10:12:43.319+07	83804d69-6aee-4e08-90fd-3690f7176671	admin	\N
652	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	master|33634	\N	2023-03-27 10:12:54.237376+07	83804d69-6aee-4e08-90fd-3690f7176671	requester	\N
653	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56548	master|40	\N	2023-03-27 10:12:54.238789+07	83804d69-6aee-4e08-90fd-3690f7176671	admin	\N
654	chats_agent_to_customer	Komentar	Mengomentari tiket anda	master|56545	111539702573555436705	\N	2023-03-27 14:08:39.49502+07	ff43bf2a-3b57-4422-aeb3-d20479a9e675	requester	\N
655	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56545	master|56545	\N	2023-03-27 14:08:44.404+07	ff43bf2a-3b57-4422-aeb3-d20479a9e675	requester	\N
656	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56545	master|40	\N	2023-03-27 14:08:44.404+07	ff43bf2a-3b57-4422-aeb3-d20479a9e675	admin	\N
657	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56545	111539702573555436705	\N	2023-03-27 14:09:35.612242+07	ff43bf2a-3b57-4422-aeb3-d20479a9e675	requester	\N
658	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56545	master|40	\N	2023-03-27 14:09:35.613908+07	ff43bf2a-3b57-4422-aeb3-d20479a9e675	admin	\N
659	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56545	master|56545	\N	2023-03-27 14:09:53.04+07	d5870193-18f0-463b-9dd3-ca46a77195e9	requester	\N
660	ticket_status_change	Perubahan status ticket	Merubah status tiket menjadi dikerjakan	master|56545	master|40	\N	2023-03-27 14:09:53.04+07	d5870193-18f0-463b-9dd3-ca46a77195e9	admin	\N
661	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56545	111539702573555436705	\N	2023-03-27 14:09:59.575967+07	d5870193-18f0-463b-9dd3-ca46a77195e9	requester	\N
662	ticket_done	Penyelesaian ticket	Sudah menyelesaikan tiket	master|56545	master|40	\N	2023-03-27 14:09:59.57768+07	d5870193-18f0-463b-9dd3-ca46a77195e9	admin	\N
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, action, subject, conditions, created_at) FROM stdin;
\.


--
-- Data for Name: priorities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.priorities (name, color, created_at, updated_at, created_by) FROM stdin;
RENDAH	#00FF00	2022-10-18 08:40:32.970687+07	2022-10-18 08:40:32.970687+07	\N
SEDANG	#FFFF00	2022-10-18 08:40:32.970687+07	2022-10-18 08:40:32.970687+07	\N
TINGGI	#FF0000	2022-10-18 08:40:32.970687+07	2022-10-18 08:40:32.970687+07	\N
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (name, created_at) FROM stdin;
admin	2022-10-18 08:40:32.977151+07
user	2022-10-18 08:40:32.977151+07
agent	2022-10-18 08:40:32.977151+07
\.


--
-- Data for Name: saved_replies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.saved_replies (id, name, content, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: status; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.status (name, created_at, updated_at, created_by) FROM stdin;
DIAJUKAN	2022-10-18 08:40:32.974971	2022-10-18 08:40:32.974971	\N
DIKERJAKAN	2022-10-18 08:40:32.974971	2022-10-18 08:40:32.974971	\N
DITOLAK	2022-10-18 08:40:32.974971	2022-10-18 08:40:32.974971	\N
SELESAI	2022-10-18 08:40:32.974971	2022-10-18 08:40:32.974971	\N
\.


--
-- Data for Name: sub_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sub_categories (id, name, category_id, created_at, updated_at, user_id, description) FROM stdin;
4	Pengembangan Fitur Aplikasi Presensi	12	2022-11-12 14:11:34.249076+07	2022-11-12 14:11:34.249076+07	master|56543	\N
5	Kesulitan dalam pengisian riwayat keluarga	11	2022-11-13 19:40:47.400662+07	2022-11-13 19:40:47.400662+07	master|56543	Riwayat keluarga susah sekali
6	Kesulitan pengisian pada aplikasi MySAPK	11	2022-11-13 19:47:57.371716+07	2022-11-13 19:47:57.371716+07	master|56543	Wangel e cak cak
8	Reset Password dan Email	11	2022-11-16 03:05:31.022338+07	2022-11-16 03:05:31.022338+07	master|56543	\N
9	Error LDAP	11	2022-11-16 03:05:51.280488+07	2022-11-16 03:05:51.280488+07	master|56543	\N
10	Acess Token Empty	11	2022-11-16 03:06:08.41874+07	2022-11-16 03:06:08.41874+07	master|56543	\N
11	Edit Unor MySAPK	11	2022-11-17 13:54:46.447215+07	2022-11-17 13:54:46.447215+07	master|56543	\N
12	Seleksi dan Pengumuman P3K dan CPNS	24	2023-03-09 04:18:04.94824+07	2023-03-09 04:18:04.94824+07	master|56543	\N
13	Kesulitan Pengisian pada SIASN	25	2023-03-09 04:23:22.463335+07	2023-03-09 04:23:22.463335+07	master|56543	\N
14	Layanan Umum	27	2023-03-18 07:04:07.660397+07	2023-03-18 07:04:07.660397+07	master|40	Pengajuan Magang, Penelitian, Data, dll
\.


--
-- Data for Name: sub_faqs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sub_faqs (id, question, answer, user_id, created_at, updated_at, faq_id) FROM stdin;
7	Apa itu Pemutakhiran Data Mandiri?\n	Pemutakhiran Data Mandiri adalah proses peremajaan dan pembaharuan data secara mandiri yang bertujuan untuk mewujudkan data yang akurat, terkini, terpadu, berkualitas baik sehingga dapat menciptakan interoperabilitas Data	master|56543	2022-11-12 18:56:12.786054+07	2022-11-12 18:56:12.786054+07	21
8	Siapa saja yang wajib mengikuti Pemutakhiran Data Mandiri?	Aparatur Sipil Negara (PNS dan PPPK) dan Pejabat Pimpinan Tinggi Non-ASN	master|56543	2022-11-12 18:56:38.256231+07	2022-11-12 18:56:38.256231+07	21
9	Apakah diperbolehkan ASN mengambil cuti sebelum atau sesudah cuti bersama / hari libur nasional ?	Diperbolehkan. Pegawai ASN tidak mengajukan cuti pada saat sebelum dan/ atau sesudah hari libur nasional tertuang pada SE Menpan RB No. 13 Tahun 2021 dikarenakan untuk mencegah dan memutus rantai penyebaran Covid-19. Namun pada SE Menpan RB No. 13 Tahun 2022 berisi tentang Pemerintah dapat memberikan cuti tahunan kepada ASN sebelum atau sesudah hari libur nasional dan cuti bersama, hal ini secara otomatis mencabut ketentuan pelarangan cuti dan bepergian sebelum dan sesudah hari libur nasional dan cuti bersama. 	master|58521	2023-03-07 09:12:15.442703+07	2023-03-07 09:12:15.442703+07	22
10	Bagaimana proses pengusulan penghargaan Satyalancana Karya Satya bagi PNS Provinsi Jawa Timur ?	Proses pengusulan penghargaan Satyalancana Karya Satya bagi PNS Provinsi Jawa Timur yaitu \n1. Lolos persyaratan masa kerja telah melewati 10 tahun, 20 tahun, dan 30 tahun\n2. Mengajukan kepada pengelola kinerja pada instansi masing masing\n3. Pengelola kinerja instansi membuat dokumen persyaratan yang dibutuhkan yaitu : DRH, SK CPNS, SK Jabatan Terakhir, SK Pangkat Terakhir, Surat Keterangan Tidak Pernah Dijatuhi Hukuman Disiplin (dijadikan 1 pdf dengan ukuran maksimal 3 MB)\n4. Pengelola kepegawaian mengusulkan melalui aplikasi e-Satyalancana pada E-Master\n5. Verifikasi admin BKD Provinsi Jawa Timur \n6. Verifikasi admin Kemendagri pada web ula.kemendagri.go.id\n7. Verifikasi admin Sekretariat Negara dan proses pencetakan piagam penghargaan dan lencana dan dikirim ke kemendagri\n8. Kemendagri mendistribusikan kepada seluruh provinsi di Indonesia\n9. Provinsi Jawa Timur memberikan piagam dan lencana kepada instansi yang mengusulkan.	master|58521	2023-03-07 09:29:09.408547+07	2023-03-07 09:29:09.408547+07	23
11	Bagaimana mekanisme dan persyaratan pindah/mutasi pegawai ?	Mekanisme untuk mutasi pegawai :\n1.\tBadan Kepegawaian Daerah menetapkan keputusan perpindahan antar Kab/Kota dalam Provinsi Jawa Timur, Dinas/Badan/Kantor di Lingkungan Pemerintah Provinsi Jawa Timur;\n2.\tBadan Kepegawaian Daerah mengusulkan ke Kanreg II BKN bagi perpindahan PNS dari luar Provinsi Jawa Timur/Departemen ke lingkungan Pemerintah Provinsi Jawa Timur;\n3.\tBadan Kepegawaian Daerah meneruskan permohonan pindah dari instansi asal ke instansi tujuan apabila belum ada surat pernyataan persetujuan menerima dari instansi yang dituju.\n\nUntuk persyaratan pindah/mutasi pegawai sesuai dasar hukum dapat mempedomani :\n1.\tPeraturan Gubernur Jawa Timur Nomor 36 Tahun 2019 tentang Mutasi PNS\n2.\tPeraturan Gubernur Jawa Timur Nomor 52 Tahun 2022 tentang Perpindahan PNS\n3.\tTerkait persyaratan, ruang lingkup dan prosedur dapat mempelajari dan memperhatikan informasi pada Layanan yang tertera di Website BKD Provinsi Jawa Timur\n	master|40	2023-03-08 14:38:19.449817+07	2023-03-08 14:38:19.449817+07	24
\.


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tickets (id, title, description, content, html, ticket_number, assignee, requester, created_at, updated_at, start_work_at, completed_at, assignee_json, requester_json, file_url, finished_at, chooser, chooser_picked_at, status_code, category_id, priority_code, assignee_reason, stars, requester_comment, has_feedback, sub_category_id, skip_feedback, is_published, is_pinned, is_locked, is_edited) FROM stdin;
09169b6c-d830-4fba-8e08-87993524b53b	Mengisi MySAPK	\N	<p>terkait riwayat organiasi, saya tergabung dalam komunitas MGMP. apa yang harus saya unggah terkait bukti organisasi saya, sementara kartu komunitas saya di SIM PKB tidak dapat di print out. mohon petunjuk dan terima kasih.</p>	\N	NK9CV	master|40	master|70383	2022-11-12 15:00:04.578441+07	2023-02-13 18:06:43.124+07	2022-11-13 23:09:25.673+07	2023-02-13 18:06:43.124+07	\N	\N	\N	2023-02-13 18:06:43.124	master|40	2022-11-12 18:21:02.208	SELESAI	\N	SEDANG	terimakasih	\N	\N	f	6	f	f	f	f	f
8c4e4117-056d-4a39-8602-5aabe70dd54b	Kapan program PPPK di mulai?	\N	<p><strong>kapan program PPPK di mulai?</strong></p>	\N	DVSQ5	master|40	pttpk|1383	2022-11-12 13:39:41.984058+07	2023-03-02 05:27:15.612+07	2022-11-13 23:13:32.789+07	2023-03-02 05:27:15.612+07	\N	\N	\N	2023-03-02 05:27:15.612	master|40	2022-11-12 18:21:21.691	SELESAI	\N	SEDANG	terimakasih	\N	\N	f	12	f	f	f	f	f
db65a963-23f5-4b60-bb80-c3f15040e92f	Epresensi	\N	<p>Epresensi mohon ditmbhi fitur face id kl mau absen,, menghindari dan meminimalisir pegawai titip absen</p>	\N	E6NXJ	master|56543	master|26742	2022-11-12 08:29:16.110361+07	2022-11-12 17:46:02.9+07	2022-11-12 14:05:07.688+07	2022-11-12 17:46:02.9+07	\N	\N	\N	2022-11-12 17:46:02.9	master|56543	2022-11-12 14:04:40.785	SELESAI	\N	SEDANG	sudah direncanakan oleh bidang pkph terkait face recognition untuk absensi	\N	\N	f	4	f	f	f	f	f
59749fe7-d7bd-4135-b6a0-b4a501e384ae	BELUM BISA MASUK MYSAPK	\N	<p>Kepada :</p><p>Team BKD Jatim</p><p>saya belum bisa masuk akun mySAPK dengan data sbb :</p><ol><li>Nama</li><li>NIP</li><li>E-mail</li></ol><p>Mohon bantuan untuk segera berfungssi normal</p><p>Demikian terimakasih.</p><p><br><img src="https://siasn.bkd.jatimprov.go.id:9000/public/bf308b8090289deb060aedf8d5ea8c44474496c8_image.png"></p>	\N	4HKYQ	master|40	113359564305461720000	2022-11-12 06:55:54.456381+07	2022-11-12 07:12:07.924+07	2022-11-12 07:07:30.735+07	2022-11-12 07:12:07.924+07	\N	\N	\N	2022-11-12 07:12:07.924	master|40	2022-11-12 07:05:40.91	SELESAI	\N	SEDANG	sudah silahkah dicoba	5	sangat cepet responnya dan ramah cara penyampaiannya.	t	6	f	f	f	f	f
8f69ea77-b08e-4269-be92-3ce0e602f958	penyesuaian ijazah sebelum cpns	\N	<p>ijin bertanya.</p><p>saya lulusan D4 kebidanan, mendaftar CPNS menggunakan ijazah D3 karena formasi yg dibutuhkan D3. apakah saya bisa menggunakan ijazah D4 saya (yg didapat sebelum ikut CPNS) untuk naik jabatan? </p><p>jika bisa apa saja persyaratannya. terimakasih</p>	\N	Y24SV	master|40	master|61442	2022-11-12 08:12:14.293211+07	2022-11-12 13:53:22.607+07	2022-11-12 10:59:42.249+07	2022-11-12 13:53:22.607+07	\N	\N	\N	2022-11-12 13:53:22.607	master|40	2022-11-12 10:51:31.42	SELESAI	\N	\N	dear mbak amalia,\n\n\n\njadi saat ini sudah di jenjang terampil ya, artinya jika nanti diangkat dalam JF Nakes tsb maka kenaikan pangkat seterusnya harus menggunkan AK angka kridit maka sudah bisa ajukan PAK setlah diangkat menjadi PNS penuh. \n\nLalu bagaimana dg ijasah D4 yg diperoleh sebelum cpns tadi ? Jawabannya : bisa di ajukan pengakuan ijasah ke BKD jatim c.q bidang pengembangan di jam kerja. atau melalui kepegawaian di instasni asal skrang.\n\nSilahkan segera berkodinasi. nanti saya akan beri no bidang pengembangan yang akan membantu dalam hal tsb.\n\nDemikian smga terjawab. dan terimakaih\n\n\n\nteam DASI BKD Jatim	\N	\N	f	\N	f	f	f	f	f
fdf83f2f-706c-480a-9080-d4736ee70f93	tanya fitur helpdesk	\N	<p>apakah boleh dibuatkankan video tutorial aplikasi helpdesk ini? terimakasih</p>	\N	FTY2E	master|56543	master|56552	2023-03-03 14:38:41.014704+07	2023-03-03 14:50:25.155+07	2023-03-03 14:49:15.605+07	2023-03-03 14:50:25.155+07	\N	\N	\N	2023-03-03 14:50:25.155	master|56543	2023-03-03 14:48:49.276	SELESAI	\N	\N	ok	5	ok	t	\N	f	f	f	f	f
c802d06d-41f7-4838-9e76-81c2655f3686	Mutasi PPPK	\N	<p>Saya adalah PPPK tahap II yang sebelumnya berasal dari swasta, disini saya alhamdulillah lolos seleksi namun saya salah pilih lokasi penempatan yakni di SMAN ARJASA JEMBER dimana sasaran saya sebenarnya adalah SMAN ARJASA SUMENEP, pada saat pilih formasi tidak terlihat nama kabupaten yang ada hanya pemprov Jatim kalau tidak salah sedangkan saya tidak hapal NPSN dan tidak tahu bahwa di daerah lain juga ada nama daerah yang sama, akankah ada peluang bagi saya untuk bisa mutasi ke Sumenep? mengingat saya disini sendiri dan tidak punya kerabat, karena kerabat saya semua ada di Sumenep. Atas pengertian, perhatian dan pencerahannya disampaikan terimakasih 🙏</p>	\N	70D6U	master|40	master|68842	2022-11-12 10:00:34.777123+07	2023-03-02 05:29:39.041+07	2023-03-02 05:29:28.367+07	2023-03-02 05:29:39.041+07	\N	\N	\N	2023-03-02 05:29:39.041	master|40	2022-11-14 04:37:29.222	SELESAI	\N	\N	terimakasih	\N	\N	f	\N	f	f	f	f	f
bbfb1e5c-b295-4388-a8c4-d11e7e6f17be	Tunjangan Sertifikasi	\N	<p>Sebelumnya mohon maaf, mau tanya mengapa pencairan tunjangan sertifikasi untuk tahap ketiga yaitu bulan Juli, Agustus dan September  2022 mengalami keterlambatan? mohon pencerahannya agar tidak terjadi kesalahpahaman, mengingat gaji tidak naik, BBM naik dan mau beli masih ngantri  dengan antrian yang panjang! Trima kasih</p>	\N	JUGU6	master|40	114775807296498901327	2022-11-12 09:52:38.148621+07	2023-03-02 05:30:37.265+07	2023-03-02 05:30:28.088+07	2023-03-02 05:30:37.265+07	\N	\N	\N	2023-03-02 05:30:37.265	master|40	2022-11-14 04:31:32.121	SELESAI	\N	\N	terimakasih	\N	\N	f	\N	f	f	f	f	f
0efbc0dc-4032-4a1a-bfc1-47f5be78b541	Pengajuan NUPTK bagi PPPK	\N	<p>Selamat pagi,</p><p>Mohon maaf, saya mau bertanya terkait pengajuan NUPTK bagi PPPK tahun 2022. Saya berasal dr SMAN 1 Sumberpucung, Kabupaten Malang. Sudah melakukan pengajuan NUPTK sejak bulan September melalui operator sekolah. Yang mau saya tanyakan, kira-kira proses pengajuan NUPTK ini berapa lama ya?</p>	\N	FMYD9	master|40	master|69837	2022-11-12 08:44:33.159897+07	2022-11-15 08:44:08.588+07	2022-11-14 04:24:18.948+07	2022-11-15 08:44:08.588+07	\N	\N	\N	2022-11-15 08:44:08.588	master|40	2022-11-12 14:06:23.339	SELESAI	\N	SEDANG	jika masih ada pertanyaan terkait layanan kepegawaian silahkan bisa chat	\N	\N	f	12	f	f	f	f	f
eaf81bb0-140d-4b20-bac9-527ebd380432	Kartu Pegawai	\N	<p>bagaimana cara buat kartu pegawai??</p>	\N	CALWE	master|40	master|61725	2023-02-22 08:06:42.643316+07	2023-03-02 05:22:53.204+07	2023-02-23 03:30:05.953+07	2023-03-02 05:22:53.204+07	\N	\N	\N	2023-03-02 05:22:53.204	master|40	2023-02-23 03:19:28.833	SELESAI	\N	\N	terimakasih	\N	\N	f	\N	f	f	f	f	f
1c4a774b-1873-4cea-b470-e572dca19630	Ijin belajar untuk cpns	\N	<p>Assalamualaikkum,</p><p>Mohon ijin bertanya Bapak/Ibu, perkenalkan sy Nurlaela Sari CPNS Formasi 2021, TMT CPNS 1 April 2022. Sy lulusan D3, Untuk ijin melanjutkan kuliah jenjang S1 apakah bisa diajukan setelah pengangkatan PNS?</p><p><br></p><p>Terimakasih.</p>	\N	OFR6U	master|40	master|61149	2023-02-22 09:00:26.170807+07	2023-03-02 05:24:04.798+07	2023-02-23 03:23:10.507+07	2023-03-02 05:24:04.798+07	\N	\N	\N	2023-03-02 05:24:04.798	master|40	2023-02-23 03:18:48.452	SELESAI	\N	\N	terimakasih	\N	\N	f	\N	f	f	f	f	f
8514d159-c407-4a06-a630-ec8341a0073e	Data SISDMK	\N	<p>Untuk data SISDMK saya sudah terverifikasi di data SISDMK..</p><p>Kenapa pas mau daftar di PPPK kok gak bisa masuk di keterangan bilang data yg bersangkutan belom terdaftar di sisdmk padahal data saya sdh terdaftar di sisdmk mohon bantuan dan solusinya 🙏</p><p>Terimakasih</p><p><br></p><p><br></p><p><br></p><p><br></p>	\N	E0YS8	master|40	118030064912755499107	2022-11-12 10:32:33.014893+07	2023-03-02 05:26:28.567+07	2022-11-13 23:21:48.396+07	2023-03-02 05:26:28.567+07	\N	\N	\N	2023-03-02 05:26:28.567	master|40	2022-11-12 18:22:15.128	SELESAI	\N	\N	terimakasih	\N	\N	f	\N	f	f	f	f	f
951d8663-bf2d-4f58-8945-c71df19d40e4	Perpanjangan masa kerja PPPK 	\N	<p>Apa saja yang menjadi kriteria masa kerja PPPK dapat diperpanjang?</p>	\N	1W5CS	master|40	master|65684	2022-11-12 09:55:07.09898+07	2023-03-02 05:28:44.082+07	2023-03-02 05:28:35.879+07	2023-03-02 05:28:44.082+07	\N	\N	\N	2023-03-02 05:28:44.082	master|40	2022-11-14 04:32:24.943	SELESAI	\N	\N	terimakasih	\N	\N	f	\N	f	f	f	f	f
4d64f511-5fc9-47ad-b3ed-69b6d76dbf5a	Pendaftaran PPPK 2022	\N	<p>Mohon maaf bertanya, jika pendaftar merupakan prioritas 3,dan  sudah terkunci di sekolah induk, tp tdk bisa melanjutkan pendaftaran krn tertulis "mohon maaf formasi sudah tidak tersedia" Bagaimana solusinya? Apakah masih ada harapan untuk melanjutkan pendaftaran atau pasrah tdk bisa dilanjut? Terimakasih</p><p><br></p>	\N	TE9VD	master|40	115201648402085603083	2022-11-12 12:42:05.920442+07	2023-03-02 05:31:28.86+07	2022-11-12 14:07:34.598+07	2023-03-02 05:31:28.86+07	\N	\N	\N	2023-03-02 05:31:28.86	master|40	2022-11-12 14:06:57.603	SELESAI	\N	SEDANG	terimakasih	\N	\N	f	12	f	f	f	f	f
47f07fd3-1782-42d1-bf7e-ba57fe2bdd60	Penganjuan PMK	\N	<p>Dalam pengajuan Peninjauan masa kerja mohon untuk lebih mudah lagi dalam pengajuannya, jka bisa dibuatkan sistem secara online, terimakasih</p>	\N	42WAI	master|40	100057519768980321515	2022-11-12 08:59:59.073354+07	2022-11-12 15:23:31.37+07	2022-11-12 15:18:30.268+07	2022-11-12 15:23:31.37+07	\N	\N	\N	2022-11-12 15:23:31.37	master|40	2022-11-12 14:06:08.729	SELESAI	\N	\N	Terimakasih sudah mencoba fitur baru di layanan BKD jatim, mohon maaf utk pengajuan PMK saat ini masih diproses secara manual dokumen fisik. dikarenakan proses masih dibuat dari dinas pengusul - BKD dan ending ke Kanreg 2 BKN. Jadi silahkan di ajukan saya jika sudah ber status PNS ke BKD jatim bidang MUTASI bpk Hendrik.\n\nLalu apakah syarat2nya adalah sbb :\n\nSurat pengantar dari instansi,\nSK CPNS\nSK PNS\nFC iJasah\nSK Kontrak instansi\nlain2 yg dibutuhkan\nDemikian semoga berkenan dan terjawab.\n\nSalam,\n\nTeam DASI BKD Jatim	\N	\N	f	\N	f	f	f	f	f
fcc728ce-edca-4267-9c9e-10f8e99873e8	Data orang tua belum di isi di my sapk	\N	<p>Assalamualaikum.pak mau bertanya di data my sapk di bagian orang tua.kebetulan saya belum isi tapi sudah saya klik selesai.apakah bisa di perbaiki?</p>	\N	0LIDM	master|56543	115588986970313388649	2022-11-12 19:36:08.010486+07	2022-11-13 19:44:47.591+07	2022-11-12 19:43:27.005+07	2022-11-13 19:44:47.591+07	\N	\N	\N	2022-11-13 19:44:47.591	master|56543	2022-11-12 19:43:16.723	SELESAI	\N	SEDANG	masih bisa diedit oleh verifikator masing-masing instansi. Akan tetapi perlu di ingat bahwasanya verifikator instansi hanya bisa merubah tidak bisa menambahkan data. Terima kasih	\N	\N	f	5	f	f	f	f	f
087e0e16-6b12-497c-bbcc-ef252f0fcb79	Tanda Tangan pada e-materai pada seleksi PPPK	\N	<p>Assalaamualaikum, saya calon pendaftar PPPK tenaga kesehatan mohon bertanya</p><p>pada persyaratan PPPK surat lamaran, surat pernyataan 5 poin, dan surat keterangan bekerja dengan e-materai, apakah di beri tanda tangan ? Bila iya, tanda tangan nya berupa apa ya? tanda tangan basah atau TTD elektronik?</p><p>Terimakasih </p>	\N	VKNSV	master|40	pttpk|815	2022-11-12 16:30:34.619061+07	2023-03-02 05:27:30.421+07	2022-11-13 23:03:57.641+07	2023-03-02 05:27:30.421+07	\N	\N	\N	2023-03-02 05:27:30.421	master|40	2022-11-12 18:20:49.188	SELESAI	\N	SEDANG	terimakasih	\N	\N	f	12	f	f	f	f	f
54875844-5519-47b3-a36e-edc35824d152	Mohon batuan untuk sisdmk	\N	<p class="ql-align-right"><sub><strong><em><s>Mohonbantuan untuk sisdmk </s></em></strong></sub></p>	\N	RIEHK	master|40	107895398294445282010	2022-11-12 16:58:38.273353+07	2023-03-02 05:27:59.283+07	2022-11-13 23:02:16.316+07	2023-03-02 05:27:59.283+07	\N	\N	\N	2023-03-02 05:27:59.283	master|40	2022-11-12 18:20:33.082	SELESAI	\N	\N	terimakasih	\N	\N	f	\N	f	f	f	f	f
f24bc9df-6f65-4875-8090-c3204b76eed8	MySAPK BKN	\N	<p>MySAPK BKN unit verifikasi belum diisi (kosong) sehingga tidak bisa melengkapi data mandiri</p><p>Nama\t: MOHAMMAD BUDIONO</p><p>NIP\t\t: 197612072022211006</p>	\N	893WR	master|56543	113848363266517049246	2022-11-12 18:44:52.079017+07	2022-11-13 19:48:12.599+07	2022-11-12 18:57:23.733+07	2022-11-13 19:47:16.311+07	\N	\N	\N	2022-11-13 19:47:16.311	master|56543	2022-11-12 18:57:14.82	SELESAI	\N	SEDANG	User bisa memilih unit verifikator pada aplikasi MySAPK, akan tetapi pastikan terlebih dahulu bahwa ybs merupakan pegawai pemerintah provinsi jawa timur. terima kasih	\N	\N	f	6	f	f	f	f	f
1c91e46b-de43-47a6-be17-0b3aaaf3f86e	Tidak bisa Mengisi riwayat keluarga di mysapk	\N	<p>Assalamualaikum bapak/ibu. Mohon info cara isi riwayat keluarga khususnya riwayat anak. Untuk riwayat orang tua dan pasangan sudah saya tambahkan. Ketika mau menambah riwayat anak saya tidak bisa menambahkan karena tidak bisa memilih pilihan orang tua. Ketika di klik pilihan orang tua tidak muncul pilihannya. Mohon informasinya. Terimakasih</p>	\N	N1DTA	master|40	master|62808	2022-11-13 04:00:03.555466+07	2023-03-02 05:31:55.993+07	2023-03-02 05:31:48.152+07	2023-03-02 05:31:55.993+07	\N	\N	\N	2023-03-02 05:31:55.993	master|40	2022-11-14 04:38:20.953	SELESAI	\N	SEDANG	terimakasih	\N	\N	f	6	f	f	f	f	f
57bcd4af-3e31-4917-9ca0-f45031fd1e24	permohonan reset password mysapk atas nama : MAZIZUN ALIYAH.NIP : 197307262007012014	\N	<p>Selamat pagi</p><p>mohon diresetkan password Mysapk saya </p><p>nama : MAZIZUN ALIYAH.</p><p>NIP : 197307262007012014</p><p>Instansi : SMAN 1 TARUNA MADANI JATIM /SMAN 1 BANGIL,</p><p>email awal  :<a href="mailto:mazizunmat1973@gmail.com" rel="noopener noreferrer" target="_blank">mazizunmat1973@gmail.com</a></p><p>mohon dikirim ke email : <a href="mailto:mazizunaliyah67@guru.sma.belajar.id" rel="noopener noreferrer" target="_blank">mazizunaliyah67@guru.sma.belajar.id</a></p><p> Karena kami lupa passwod mysapk</p>	\N	MRV6D	master|40	115066139582912607057	2022-12-12 08:27:54.731611+07	2023-03-02 05:23:52.86+07	2023-02-23 03:25:41.124+07	2023-03-02 05:23:52.86+07	\N	\N	\N	2023-03-02 05:23:52.86	master|40	2023-02-19 08:36:31.192	SELESAI	\N	SEDANG	terimakasih	\N	\N	f	8	f	f	f	f	f
1c7609c9-3aa0-4203-a6a3-5f0d8a59c81c	TICKET (PEMBUATAN KARIS)	\N	<p>Selamat pagi, ijin bertanya pak 🙏 cara pembuatan KARIS bagaimana nggeh pak ? Disaat CPNS atau nunggu PNS ? Terima kasih</p>	\N	AXY5V	master|40	master|61417	2023-02-22 06:36:04.596073+07	2023-03-02 05:24:39.755+07	2023-02-23 03:11:10.632+07	2023-03-02 05:24:39.755+07	\N	\N	\N	2023-03-02 05:24:39.755	master|40	2023-02-22 06:52:12.782	SELESAI	\N	\N	terimakasih	\N	\N	f	\N	f	f	f	f	f
71faf21c-ab26-46ef-a7d6-5edd7422feca	riwayat keluarga My SAPK BKN	\N	<p>mohon petunjuknya, setelah mengupload berkas riwayat keluarga, proges pengisian PDM pada riwayat keluarga masih silang(merah). bagaimana langkah selanjutnya?</p>	\N	BWSVD	master|56543	117163524863752164050	2022-11-13 00:20:24.968211+07	2022-11-13 19:55:10.199+07	2022-11-13 19:51:14.436+07	2022-11-13 19:55:10.199+07	\N	\N	\N	2022-11-13 19:55:10.199	master|56543	2022-11-13 19:50:53.861	SELESAI	\N	SEDANG	Untuk menjadikan hijau, silahkan klik data sudah sesuai secara berurutan pada riwayat keluarga. 	\N	\N	f	5	f	f	f	f	f
db63cbe4-bdc0-4eb0-9678-bff8a24544c9	Jenjang karir untuk PPPK	\N	<p>Apakah penjenjangan karir dan tunjangan-tunjangan untuk ASN PPPK kelak akan diatur juknis dan juklaknya? Terima kasih</p>	\N	HRI7I	master|40	113640464347712321324	2022-11-12 19:07:38.446275+07	2023-03-02 05:33:15.395+07	2023-03-02 05:33:06.492+07	2023-03-02 05:33:15.395+07	\N	\N	\N	2023-03-02 05:33:15.395	master|40	2022-11-14 04:37:44.291	SELESAI	\N	SEDANG	terimakasih	\N	\N	f	12	f	f	f	f	f
0066fad9-9e93-4844-b75c-fc269469f579	Penyesuaian masa kerja	\N	<p>Apabila sebelumnya dari rs swasta, berapa jumlah masa kerja yang dapat disesuaikan? Karena beredar info hanya setengah dari masa kerja yang dapat disesuaikan. Terima kasih.</p>	\N	F8ERF	master|40	master|61524	2023-02-23 05:01:40.252515+07	2023-03-02 05:21:48.336+07	2023-02-23 06:48:22.503+07	2023-03-02 05:21:48.336+07	\N	\N	\N	2023-03-02 05:21:48.336	master|40	2023-02-23 06:38:19.283	SELESAI	\N	\N	terimakasih	\N	\N	f	\N	f	f	f	f	f
79721281-b742-47e5-abb6-598c59e5c3be	Mohon Informasi SK 4C	\N	<p>Mohon informasi  apakah  SK 4c saya  sudah  bisa di download</p><p><br></p>	\N	3GUNE	master|56545	master|18225	2023-03-02 16:45:06.537901+07	2023-03-03 15:59:55.682+07	2023-03-03 15:42:56.32+07	2023-03-03 15:59:55.682+07	\N	\N	\N	2023-03-03 15:59:55.682	master|56543	2023-03-03 15:03:50.829	SELESAI	\N	\N	SK KP IVc masih proses pembuatan naskah SK	\N	\N	f	\N	f	f	f	f	f
203b4f3e-9e92-4de7-b1cf-712a0a00c50c	Pertanyaan saya mengenai perekrutan PPPK	\N	<p>Salam sejahtera, Saya Abhi Buthi Dhagsina (113-17091990-042018-9742) pegawai PTT-PK di UPT PJK Abd. Saleh Malang mau menanyakan apakah untuk perekrutan PPPK tahun 2023 harus berijasah D3/S1? sedangkan saya masih menempuh pendidikan S1 dan saat ini masih semester 5, untuk saat ini saya hanya memiliki ijasah SMK. Apakah saya bisa mengikuti perekrutan PPPK tahun 2023? mohon arahannya </p>	\N	MQZEJ	master|40	pttpk|9773	2022-11-12 21:59:21.956589+07	2023-03-02 05:32:51.351+07	2023-03-02 05:32:42.793+07	2023-03-02 05:32:51.351+07	\N	\N	\N	2023-03-02 05:32:51.351	master|40	2022-11-14 04:38:03.202	SELESAI	\N	SEDANG	terimakasih	\N	\N	f	12	f	f	f	f	f
8acc14d2-965f-4a9a-b3ab-d85791fb92c8	DAPODIK	\N	<p><br></p><p><br></p><p><br><img src="https://siasn.bkd.jatimprov.go.id:9000/public/f0426bd4f9f503bac35060fa76a53747c727b245_Screenshot_2022-11-03-14-43-14-831_com.mi.globalbrowser.jpg">Selamat siang BKD.. ￼saya YEMIMA HENDRY VEBRIANA dengan NIK 3519114902930001 ingin menyampaikan keluhan saya perihal DAPODIK saya yang masih tertahan di instansi yang lama (SDK PETRA MADIUN).. Saat ini saya mengajar di SMKN 1 MEJAYAN sudah 4 tahun 4 bulan belum dapat SK GUBERNUR dan belum bisa mengikuti P3K karena dapodik saya yang masih belum terkoneksi dengan instansi yang baru.. Mohon bantuannya untuk mengkoneksikan dapodik saya di instansi yang baru SMKN 1 MEJAYAN..</p><p>Terimakasih banyak BKD..</p>	\N	S0NCH	master|40	111115756055921574714	2022-11-12 11:22:19.517258+07	2023-03-02 05:27:00.533+07	2022-11-13 23:15:32.124+07	2023-03-02 05:27:00.533+07	\N	\N	\N	2023-03-02 05:27:00.533	master|40	2022-11-12 18:21:34.636	SELESAI	\N	\N	terimakasih	\N	\N	f	\N	f	f	f	f	f
7863a74a-7818-4dbb-9671-28d8ea959814	Terkait Penggantian TPP karena kesalahan Baca Pergub	\N	<p>hasil temuan inspektorat bahwa TPP CPNS di instansi saya salah hitung, kebanyakan dari jumlah yang seharusnya dibayarkan. Kesalahan pada salah baca PERGUB katanya, entah salah siapa. Kami disuruh mengembalikan tanpa dicicil, langsung dipotong jika TPP cair nominalnya kurang lebih 3 juta. Andai bisa dicicil sayangnya langsung dipotong, bukan salah kami tapi kami yang dirugikan. apakah tidak ada regulasi yang melindungi kami? instansi apakah tidak dapat teguran atau juga pemotongan gaji karena kelalaian yang merugikan banyak pihak?</p>	\N	1YTDV	master|40	master|61478	2023-02-22 08:11:05.647686+07	2023-03-02 05:23:07.501+07	2023-02-23 03:26:33.801+07	2023-03-02 05:23:07.501+07	\N	\N	\N	2023-03-02 05:23:07.501	master|40	2023-02-23 03:19:16.356	SELESAI	\N	\N	terimakasih	\N	\N	f	\N	f	f	f	f	f
de739ca3-b41a-4ed3-9d56-38b8b7333b71	Riwayat Keluarga	\N	<p>Selamat Pagi,</p><p>Mohon arahan https://mysapk.bkn.go.id/ di menu Riwayat keluarga, sudah memasukkan KTP Ibu dan masuk ke history pengajuan. Namun, ketika diklik Data riwayat ortu sudah sesuai, tombol riwayat keluarga masih merah belum hijau.</p><p>Nomor NIP PPPK 198112092022212016</p><p>Terima kasih.</p>	\N	A8PTI	master|56543	111850381925090480094	2022-11-13 10:51:49.342215+07	2022-11-13 19:41:06.36+07	2022-11-13 19:35:59.367+07	2022-11-13 19:39:48.986+07	\N	\N	\N	2022-11-13 19:39:48.986	master|56543	2022-11-13 19:35:47.81	SELESAI	\N	RENDAH	riwayat keluarga sudah masuk diverifikasi instansi. Untuk menjadikan hijau diriwayat keluarga, pastikan klik data sesuai secara berurutan	\N	\N	f	5	f	f	f	f	f
6a96c555-62a9-411e-9150-4769e680b1e2	Pertanyaan mengenai MySAPK	\N	<h4>MySAPK tidak bisa login tulisan pasword salah dan email salah pdhal sudah benar harus bagaimana ya ?</h4>	\N	I29XP	master|56543	116327472568778270097	2022-11-15 06:09:22.779306+07	2022-11-17 13:58:08.56+07	2022-11-15 18:06:10.588+07	2022-11-17 13:58:08.56+07	\N	\N	\N	2022-11-17 13:58:08.56	master|56543	2022-11-15 18:05:59.24	SELESAI	\N	SEDANG	pastikan username merupakan nip tanpa spasi. apabila lupa password bisa menggunakan fitur dari mysapk yaitu lupa password, kalau ingin mengganti email silahkan open tiket baru	\N	\N	f	6	f	f	f	f	f
61b169b4-3d4b-43b5-84dd-1668ed222e8a	Riwayat keluarga dan pendidikan	\N	<p>Saya Ika Agustin Rahmawati NIP 199208052022212024</p><p><br></p><ol><li>riwayat keluarga sudah saya isi, namun masih merah. Apakah berpengaruh, saya tidak mengisi pasangan dan anak karena masih single?</li><li>riwayat pendidikan saya sudah saya isi, namun lupa tidak mencantumkan gelar (Gr) untuk yang sudh sertifikasi, saya mau edit sudah tidak bisa. Lalu solusinya bagaimana ya pak? Terima kasih sebelumnya </li></ol>	\N	5Q8YG	master|56543	116423286111481434115	2022-11-14 21:24:08.04141+07	2022-11-15 18:15:03.948+07	2022-11-15 18:09:19.416+07	2022-11-15 18:15:03.948+07	\N	\N	\N	2022-11-15 18:15:03.948	master|56543	2022-11-15 18:09:09.636	SELESAI	\N	SEDANG	untuk riwayat keluarga supaya hijau klik data sudah sesuai secara berurutan, yang kedua jika ada kekeliruan data di mysapk bisa diedit melalui verifikator masing-masing opd. terima kasih	\N	\N	f	6	f	f	f	f	f
433c6db8-ea17-4dd4-b5ba-d123cec4fa15	Syarat Pengajuan Penambahan Masa Kerja	\N	<p>Selamat Pagi</p><p>Saya Arvy Iedara Rohi, NIP 19941126 202204 100 1 Biro Hukum Setda Prov Jatim</p><p>Ijin bertanya, saya sebelumnya telah bekerja di perusahaan swasta selama 4 tahun</p><p>Apakah bisa menambah masa kerja, dan jika bisa syarat apa saja yg d butuhkan dan alur pengajuannya seperti apa?</p><p><br></p><p>Terima Kasih</p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p>	\N	KT6GI	master|40	107951032401848979939	2023-02-23 04:12:17.455531+07	2023-03-02 05:22:40.124+07	2023-02-23 06:45:31.395+07	2023-03-02 05:22:40.124+07	\N	\N	\N	2023-03-02 05:22:40.124	master|40	2023-02-23 06:38:01.837	SELESAI	\N	\N	terimakasih	\N	\N	f	\N	f	f	f	f	f
a5155cbc-8999-49d5-95eb-bb718941a13d	Sanggah P1 mapel PKWU dua kali lolos PG tidak dapat formasi	\N	<p>Mohon  Kebijakan pemerintah Provinsi Jawa Timur, saya sudah lulus PG baik tes tahap 1 maupun tahap 2, bidang keilmuan saya perikanan tapi mengambil PKWU, </p><p>Sesuai peraturan pendidikan saya linier dg PKWU, saya sudah mengajar selma 8 tahun, mohon kebijakannya mendapatkan formasi </p>	\N	35018	master|40	108420766870636421264	2022-11-13 13:37:59.524025+07	2023-03-02 05:31:09.108+07	2023-03-02 05:31:00.115+07	2023-03-02 05:31:09.108+07	\N	\N	\N	2023-03-02 05:31:09.108	master|40	2022-11-16 05:40:06.665	SELESAI	\N	SEDANG	terimakasih	\N	\N	f	12	f	f	f	f	f
cf74bd69-35f8-477e-a218-0b0a6216cb70	Usul Perbaikan Nama 	\N	<p>Ijin Nama saya pada SIASN dan SIMASTER tidak sesuai</p>	\N	2P186	master|56543	master|56548	2023-03-03 14:27:35.158449+07	2023-03-03 14:41:08.171+07	2023-03-03 14:33:24.28+07	2023-03-03 14:40:09.79+07	\N	\N	\N	2023-03-03 14:40:09.79	master|56543	2023-03-03 14:32:22.866	SELESAI	\N	SEDANG	untuk perbaikan data sudah dilakukan update unor di SIASN	\N	\N	f	11	f	f	f	f	f
f9c67d42-3751-4295-b61f-5074a96f8394	Jadwal CAT rekrutmen PPPK 	\N	<p>Selamat pagi mimin, ijin bertanya untuk jadwal CAT Rekrutmen PPPK, disurat hanya di sampaikan pada tanggal 10 Maret s/d 1 April 2023, kira-kira pengumuman resmi terkait hari dan sesi sesi nya, di publish kapan ya?</p>	\N	4GYD4	master|40	pttpk|9590	2023-03-01 08:29:52.416249+07	2023-03-04 10:27:43.841+07	2023-03-03 20:46:17.883+07	2023-03-04 10:27:43.841+07	\N	\N	\N	2023-03-04 10:27:43.841	master|40	2023-03-03 20:43:48.647	SELESAI	\N	\N	terimakasih sudah memanfaatkan layanan helpdesk BKD jatim, semoga bermanfaat	\N	\N	f	\N	f	f	f	f	f
6a7cfdc5-7dd9-4f2b-b1c4-3fb47b586614	Penempatan PPPK Guru	\N	<p>Selamat siang, saya Qaharrudin Widyarto dari SMKN 5 Malang. saya ingin menanyakan terkait prosedur penempatan PPPK tahun 2022,</p><ol><li>Bagaimana cara menentukan lokasi formasi yang akan dijadikan sebagai lokasi penempatan?</li><li>Bagaimana jika lokasi penempatan tidak sesuai dengan harapan dari pendaftar PPPK?</li><li>Apakah PPPK bisa mengajukan mutasi ketika ada proses perpanjangan kontrak pada April 2023 nanti?</li></ol><p>saya ucapkan terimakasih atas perhatian dan jawaban yang diberikan.</p>	\N	WRTGH	master|40	master|67134	2022-11-14 11:54:07.728134+07	2023-03-02 05:25:12.279+07	2022-11-20 00:37:20.923+07	2023-03-02 05:25:12.279+07	\N	\N	\N	2023-03-02 05:25:12.279	master|40	2022-11-16 05:40:28.918	SELESAI	\N	SEDANG	terimakasih	\N	\N	f	12	f	f	f	f	f
c74af5ae-0037-472f-894e-b8e5e5e49829	Cuti Pada Tanggal 20 - 21 Maret 2023	\N	<p>Selamat sore perkenalkan saya Dimas Ridho staff kepegawaian RSUD Husada Prima</p><p>Mohon izin bertanya , ada pegawai kami yang akan mengajukan cuti di tanggal 20 - 21 Maret 2023. Berhubung pada tanggal 22 Maret 2023 tanggal merah apa diperkenankan untuk melakukan cuti di tanggal tersebut?</p><p>Mohon arahannya, terima kaish</p>	\N	HYY11	master|58521	pttpk|11678	2023-02-28 16:08:44.068824+07	2023-03-06 15:00:16.779+07	2023-03-06 14:49:15.83+07	2023-03-06 15:00:16.779+07	\N	\N	\N	2023-03-06 15:00:16.779	master|40	2023-03-03 20:44:49.22	SELESAI	\N	\N	Tidak ada ketentuan yang menyebutkan tidak diperbolehkan mengambil cuti sebelum/sesudah cuti bersama/harlibnas	\N	\N	f	\N	f	f	f	f	f
b5217503-273b-4b6e-8026-2c712f3d994a	Menggati UNOR di MYSAPK	\N	<p>Assalamu' Allaikum Wr. Wb.</p><p>Dikarenakan Mutasi kepegaiwaian maka data MYSAPK saya terdapat data yang belum sesuai, yaitu data UNOR dimana data UNOR saya masih ikut UNOR lama.</p><p>Data UNOR di MYSAPK saya masih SMKN 4 Madiun yang seharusnya SMKN 1 Jiwan.</p><p>Atas perhatian dari Bpk/ Ibu saya sampaikan terima kasih</p><p>Hormat saya.</p><p>Wasalamu' Allaikum Wr. Wb.</p>	\N	Q5L8P	master|56543	master|9312	2022-11-17 11:38:00.420922+07	2022-11-17 14:07:35.712+07	2022-11-17 13:58:53.816+07	2022-11-17 14:07:35.712+07	\N	\N	\N	2022-11-17 14:07:35.712	master|56543	2022-11-17 13:55:05.917	SELESAI	\N	SEDANG	status usulan masih belum diverifikasi. artinya apabila ada perubahan data, bisa mengajukan dalam hal ini cabang dinas kota madiun	\N	\N	f	11	f	f	f	f	f
d8b8dd9f-13ce-4993-9548-bcd5590d722e	Petunjuk pengajuan Tugas Belajar	\N	<p>Assalamualaikum, wr. wb.</p><p>Dengan hormat,</p><p>Saya Achmad Shocheb PNS di UPT SMAN 1 Singosari, Kabupaten Malang. Tahun ini saya mendaftar beasiswa S2 dari Lembaga Pengelola Dana Pendidikan (LPDP) Kementrian Keuangan dan telah dinyatakan diterima untuk memulai studi pada Bulan Juli 2023. Saya mendaftar beasiswa tersebut berdasarkan surat Rekomendasi dari Dinas Pendidikan Provinsi Jawa Timur tertanggal 31 Maret 2022 seperti saya lampirkan pada surat ini.</p><p>Untuk tahap selanjutnya, saya diwajibkan oleh pihak pemberi beasiswa untuk mengajukan Permohonan Tugas Belajar ke Badan Kepegawaian Daerah. Maka dari itu, mohon petunjuk berkas apa saja yang perlu saya siapkan untuk pengajuan Tugas Belajar.</p><p>Demikian surat ini saya sampaikan. Atas perhatiannya saya ucapkan terima kasih.</p><p><br></p><p>Hormat saya,</p><p><br></p><p>Achmad Shocheb</p><p><br><img src="https://siasn.bkd.jatimprov.go.id:9000/public/f91f3d562e91a14c3567d378e713d5ed6a8e6c52_Rekomendasi.jpeg"></p>	\N	N7IIN	master|40	master|59715	2022-11-13 06:31:05.075058+07	2022-11-20 00:41:55.549+07	2022-11-15 08:46:24.788+07	2022-11-20 00:41:55.549+07	\N	\N	\N	2022-11-20 00:41:55.549	master|40	2022-11-14 04:38:57.776	SELESAI	\N	\N	terjawab	\N	\N	f	\N	f	f	f	f	f
ea572511-e79c-438d-b2c9-57461f824877	perbaikan data integrasi SIASN dan SIMASTER 	\N	<p>dimohon untuk dibuat tutorial atau langkah langkah pertama misal perubahan di SIASN dahulu lalu kita bisa melihat perubahan pada SIMASTER....terima kasih  mantap team BKD </p>	\N	GWTHP	master|56543	master|46893	2023-02-21 19:05:38.821258+07	2023-02-21 21:26:17.789+07	2023-02-21 21:24:50.215+07	2023-02-21 21:26:17.789+07	\N	\N	\N	2023-02-21 21:26:17.789	master|56543	2023-02-21 21:24:15.981	SELESAI	\N	SEDANG	Sudah include di ppt	\N	\N	f	13	f	f	f	f	f
26faccf0-e7f3-4355-89be-3e38e12b3783	APAKAH BOLEH MEMBAWA PESERTA LEBIH DARI 2 ORANG PADA ACARA RAKOR KEDIRI ?	\N	<p>Kepada : </p><p>Panitya BKD Jatim</p>	\N	TQXCB	master|72	master|40	2023-02-16 06:44:22.531102+07	2023-02-16 06:44:22.531102+07	\N	\N	\N	\N	\N	\N	master|40	2023-02-19 08:36:56.078	DIAJUKAN	\N	\N	\N	\N	\N	f	\N	f	f	f	f	f
f979042d-a5c0-4b5c-9909-830841e37325	Laporan	\N	<p>Untuk melakukan pengaduan atau laporan melalui apa y? </p>	\N	2TKSX	master|56543	109524029811118075633	2022-11-21 09:59:34.148603+07	2022-11-21 19:17:25.161+07	2022-11-21 19:15:56.358+07	2022-11-21 19:17:25.161+07	\N	\N	\N	2022-11-21 19:17:25.161	master|56543	2022-11-21 19:15:47.063	SELESAI	\N	\N	untuk pertanyaan seputar kepegawaian bisa di helpdesk bkd di alamat ini\n\natau bisa melalui web bkd jatim\n\ndi alamat https://bkd.jatimprov.go.id/wbsbkdjatim/pengaduan\n\nterim kasih	\N	\N	f	\N	f	f	f	f	f
6e45b099-9a8d-489e-941d-efed7ead63db	pemutakhiran data di MySAPK BKN	\N	<p>Mohon maaf bapak/ibu admin. Pada saat saya akan mengisi pemutakhiran data disitu ada tulisan merah yang menyatakan untuk memilih unit verifikasi.</p><p>Saya diharuskan memilih yang mana ya.</p><p>Saya ASN p3k di wilayah kab. BANYUWANGI, Prop.Jatim</p><p>Terimakasih saya tunggu ko firmasinya</p>	\N	QQ8D9	master|56543	105106952708336013003	2022-11-15 09:29:04.03288+07	2022-11-17 13:56:35.688+07	2022-11-15 18:03:28.741+07	2022-11-17 13:56:35.688+07	\N	\N	\N	2022-11-17 13:56:35.688	master|56543	2022-11-15 18:03:19.94	SELESAI	\N	SEDANG	untuk memilih unit verifikasi silahkan pilih unor yang sesuai dengan keadaan yang sekarang	\N	\N	f	6	f	f	f	f	f
fb9d5b01-ee7f-4f0c-906a-9300792a51a6	Pengumuman Mutasi Kepegawaian	\N	<p>Selamat siang Bapak/Ibu, izin menanyakan untuk pengumuman mutasi kepegawaian dari pusat ke daerah kira-kira apakah sdh ada infonya ? Mohon informasi lebih lanjut, terima kasih .</p>	\N	MPEBL	master|56548	112226202854798199276	2023-03-16 11:06:32.796046+07	2023-03-17 09:12:25.068+07	2023-03-17 09:09:37.954+07	2023-03-17 09:12:25.068+07	\N	\N	\N	2023-03-17 09:12:25.068	master|40	2023-03-16 13:29:17.832	SELESAI	\N	\N	Atau bisa berkoordinasi dengan pengelola kepegawaian Instansi asal atau BKD asal	\N	\N	f	\N	f	f	f	f	f
413d31a6-88e6-4743-ab4c-c7d9ce5d3b12	Update Unor pada aplikasi SIASN BKN	\N	<p>Saya adalah verifikator di Perangkat Daerah A, ada pegawai kami yang mau naik pangkat sedangkan jabatannya masih salah bagaimana ya pak? Apakah saya verifikator bisa melakukan update ya pak?</p><p><br><img src="https://siasn.bkd.jatimprov.go.id:9000/public/ec781c94d4f6d0c40a8ae3ccc1fe319dfccca004_ss.png"></p><p>Ini gambarnya bang</p><p>Terima kasih :)</p>	\N	O2KUY	master|56543	105503740477298041174	2023-01-28 18:29:27.53173+07	2023-01-28 18:41:23.484+07	2023-01-28 18:31:31.912+07	2023-01-28 18:41:23.484+07	\N	\N	\N	2023-01-28 18:41:23.484	master|56543	2023-01-28 18:31:15.121	SELESAI	\N	SEDANG	Membuat usulan baru di SIASN dengan menyiapkan dokumen yang dibutuhkan	5	Mantap gan!!	t	11	f	f	f	f	f
aa855d32-a369-4851-b582-b4e4e2f3e470	Pengangkatan CPNS ke PNS	\N	<p>Untuk pengangkatan CPNS menjadi PNS apakah sesuai dengan yg ada di peraturan kah min, minimal 1 tahun atau bisa lebih dari 1 tahun dari TMT CPNS? Terimakasih min. Mohon responnya 🙏🏻</p>	\N	F6784	master|40	108063347615393395047	2023-02-22 06:25:06.456407+07	2023-03-02 05:24:24.737+07	2023-02-23 03:13:41.413+07	2023-03-02 05:24:24.737+07	\N	\N	\N	2023-03-02 05:24:24.737	master|40	2023-02-22 06:51:41.448	SELESAI	\N	\N	terimakasih	\N	\N	f	\N	f	f	f	f	f
73dbd6d9-c8b7-4657-bfa0-32a581f73a8b	lupa password mysapk	\N	<p>Assalamualaikum,&nbsp;Pada Mysapk lupa password dan juga lupa password pada email <a href="mailto:mazizunmat1973@gmail.com" rel="noopener noreferrer" target="_blank">mazizunmat1973@gmail.com</a>&nbsp;&nbsp;&nbsp;, bagaimana solusinya?</p><p><br></p>	\N	PHAJC	master|40	115066139582912607057	2022-12-11 11:17:40.951449+07	2023-02-13 18:25:02.117+07	2023-02-13 18:07:11.428+07	2023-02-13 18:25:02.117+07	\N	\N	\N	2023-02-13 18:25:02.117	master|40	2023-02-13 18:05:13.337	SELESAI	\N	SEDANG	bisa msh terkendala bisa masuk ke layanan WA center di Website BKD JATIM	\N	\N	f	8	f	f	f	f	f
aea2f495-f927-4ae5-89ae-d6a2185b470a	Penambahan gelar di sapk	\N	<p>Ijin bertanya bagaimana cara meng edit penambahan pendidikan dan pembubuhan gelar  di aplikasi sapk? Terima kasih</p>	\N	9BFXZ	master|56543	master|34233	2023-02-21 19:47:03.30131+07	2023-02-21 21:29:39.781+07	2023-02-21 21:27:29.897+07	2023-02-21 21:29:39.781+07	\N	\N	\N	2023-02-21 21:29:39.781	master|56543	2023-02-21 21:27:04.007	SELESAI	\N	\N	Penambahan gelar bisa dikonsultasikan ke bidang pengembangan. Untuk di sapk masih belum ada	\N	\N	f	\N	f	f	f	f	f
08257e06-61fe-45d0-a4d2-aff508366c9b	Mutasi pekerjaan	\N	<p>Izin bertanya untuk mutasi pekerjaan dari kediei ke surabaya saya harus menghubungi siapa y kalai di BKD? </p>	\N	HF6AW	master|40	108416657661466806916	2023-02-22 06:18:40.749585+07	2023-03-02 05:24:55.123+07	2023-02-22 06:49:04.985+07	2023-03-02 05:24:55.123+07	\N	\N	\N	2023-03-02 05:24:55.123	master|40	2023-02-22 06:47:49.375	SELESAI	\N	\N	terimakasih	\N	\N	f	\N	f	f	f	f	f
e6f6b651-f891-406a-bdd0-bf1aa7039451	seputar cpns p3k teknis	\N	<p>kapan cpns p3k teknis dimulai?</p>	\N	KAIMJ	master|95	103921334554472834759	2023-03-02 10:43:35.248312+07	2023-03-02 10:51:25.465+07	2023-03-02 10:50:23.204+07	2023-03-02 10:51:25.465+07	\N	\N	\N	2023-03-02 10:51:25.465	master|95	2023-03-02 10:48:19.309	SELESAI	\N	\N	pertanyaan terjawab. p3k teknis dilaksanaka pada tanggal sekian ...	5	oke punya	t	\N	f	f	f	f	f
28a60737-2df7-45ab-8888-7aa44c643d67	Pensiun 	\N	<p>sudah pengajuan atas anama subari belum terbit SK Pensiun Janda</p>	\N	1QEHL	master|56545	105622302617721260523	2023-02-28 11:47:57.794998+07	2023-03-21 16:33:41.366+07	2023-03-21 16:32:02.371+07	2023-03-21 16:33:41.366+07	\N	\N	\N	2023-03-21 16:33:41.366	master|40	2023-03-03 20:45:38.185	SELESAI	\N	\N	Usul pensiun belum terbit\n	\N	\N	f	\N	f	f	f	f	f
dd70db0a-82c8-4f9e-9bcb-8ad30c43ad9b	reset email mysapk	\N	<p>mohon ijin akun saya dengan nip xxx tidak bisa masuk email pada mysapk mohon diganti dengan yang baru .xxx@gmail.com</p>	\N	SS9C3	master|56543	master|56543	2023-03-03 14:27:31.765059+07	2023-03-07 05:12:29.117+07	2023-03-07 05:12:00.697+07	2023-03-07 05:12:29.117+07	\N	\N	\N	2023-03-07 05:12:29.117	master|40	2023-03-04 10:24:20.056	SELESAI	\N	\N	Ini hanya test percobaan	5	oke wkwkkw	t	\N	f	f	f	f	f
8ac8787c-5c6b-4152-98e1-7cb6de1a2fd7	Mutasi ke Pemprov.Jatim	\N	<p>Assalamualaikum.</p><p>Admin,minta tolong dibantu share jika ingin mutasi ke lingkup pemprov Jatim apa saja syaratnya?</p>	\N	G0TG6	master|56548	108422352061899836997	2023-03-04 09:13:38.156669+07	2023-03-07 09:22:34.701+07	2023-03-06 14:40:15.039+07	2023-03-07 09:22:34.701+07	\N	\N	\N	2023-03-07 09:22:34.701	master|40	2023-03-04 10:23:13.665	SELESAI	\N	\N	Untuk lebih jelasnya bisa memperhatikan informasi pada Layanan Informasi pada Website BKD Provinsi Jawa Timur	\N	\N	f	\N	f	f	f	f	f
91545bd4-8982-479a-a687-9baba29c31c7	Jenis Aktivitas pada target kerja SKP 2023	\N	<p>Assalamualaikum Wr. Wb.</p><p>Ijin bertanya dalam target prestasi kerja tahun 2023 terdapat kolom jenis aktivitas dengan pilihan 1) Key Activites dan 3) Support Activities. </p><p>Apakah ada buku petunjuk atau video berupa contoh atau penjelasan yang bisa menjelaskan kepada saya tentang 2 jenis aktivitas tersebut yang sesuai dan bisa saya pahami. dikarenakan penjelasan pada *CATATAN : (berlatar Kuning)* kurang bisa memberikan pengertian penuh bagi saya.</p><p>Terima kasih</p>	\N	SO868	master|58521	master|48655	2023-03-04 11:25:23.419816+07	2023-03-06 15:19:31.525+07	2023-03-06 15:13:29.211+07	2023-03-06 15:19:31.525+07	\N	\N	\N	2023-03-06 15:19:31.525	master|40	2023-03-05 17:17:29.721	SELESAI	\N	\N	jika masih bingung dengan pengerjaan SKP dapat mengunjungi kantor kami di bidang PKPH BKD Jatim	\N	\N	f	\N	f	f	f	f	f
310aabc8-0177-4c8c-b3de-58a056a228a9	Penempatan P3K Guru	\N	<p>Selamat malam</p><p>Untuk pengumuman penempatan P3K guru kapan ?</p><p>Terima kasih</p>	\N	29VNM	master|56543	100898213862692765791	2023-03-05 20:49:17.745325+07	2023-03-15 09:29:15.826+07	2023-03-15 09:20:10.281+07	\N	\N	\N	\N	\N	master|40	2023-03-06 14:44:46.29	DIKERJAKAN	\N	SEDANG	\N	\N	\N	f	12	f	f	f	f	f
cbcd7b76-6daa-4827-aee2-ce0fcefa980a	Prosedur mutasi PNS dari Kementerian Keuangan	\N	<p>Selamat sore, perkenalkan saya Doni PNS Golongan II/d dari Kementerian Keuangan dengan jabatan fungsional pemeriksa. Izin bertanya untuk syarat / ketentuan dan prosedur perpindahan PNS dari Kementerian Keuangan ke Pemerintah Provinsi / Pemerintah Daerah khususnya di Jawa Timur seperti apa, dan bisa saya baca / saya pelajari di mana ya? terima kasih.</p>	\N	1KR0V	master|56548	107320671397204374523	2023-03-06 14:57:15.108962+07	2023-03-07 09:30:15.895+07	2023-03-07 09:25:39.786+07	2023-03-07 09:30:15.895+07	\N	\N	\N	2023-03-07 09:30:15.895	master|40	2023-03-07 08:47:29.279	SELESAI	\N	\N	Silahkan melihat informasi pada menu Layanan Website BKD Provinsi Jawa Timur 	\N	\N	f	\N	f	f	f	f	f
3087e298-da93-4d1a-bcbf-355b0887cc74	Pengisian MySApk 	\N	<p><strong>Pengisian karsu dan Taspen untuk PPPK di MySApk</strong><br><img src="https://siasn.bkd.jatimprov.go.id:9000/public/6009c515888db4928a97ab2caa78579cb2fefc4c_Screenshot_20221111_094134.jpg"></p>	\N	5OTMJ	master|40	master|70273	2022-11-13 04:44:24.432+07	2022-11-20 00:41:28.774+07	2022-11-16 05:31:51.285+07	2022-11-20 00:41:28.774+07	\N	\N	\N	2022-11-20 00:41:28.774	master|40	2022-11-14 04:38:40.135	SELESAI	\N	RENDAH	terjawab	\N	\N	f	6	f	f	f	f	f
377f6b8e-f75e-4937-bee8-34a86c282e8a	KARIS/ KARSU	\N	<p>bagaimana cara mengurus karis/ karsu bagi PPPK tahap 1</p>	\N	0444X	master|42	master|66870	2023-03-07 21:24:03.999889+07	2023-03-07 21:24:03.999889+07	\N	\N	\N	\N	\N	\N	master|40	2023-03-07 21:26:19.182	DIAJUKAN	\N	\N	\N	\N	\N	f	\N	f	f	f	f	f
74e03d35-8f37-4d70-b5b5-0ace4ce7ea00	sk pensiun	\N	<p>Saya akan pensiun pada bulan Oktober berkas permohonan kami sudah diterima di BKD Kab. Malang pada tgl 4Oktober 2022,yang ingin kami ketahui apakah berkas pensiun sudah masuk dalam proses BKN baik kami kirim copy data permohonan kami yg sdh masuk BKD Kab. Malang 4 Oktober 2022 Secara singkat dta kami sbb:</p><p>Nama              : Budi Hernando</p><p>NIP \t\t\t: 196310101989011002</p><p>Pangkat/Gol\t: Penata Muda/IIIb</p><p>Unit kerja\t\t: SMPN 5 KARANGPLOSO,Kab.Malang</p><p>Alamat rumah : Jl. Tirto Taruno II/6,Landungsari,Dau,Kab. Malang 65151</p><p><br><img src="https://siasn.bkd.jatimprov.go.id:9000/public/dfeb6836e6699104c54d939a4a04272ffc5f6704_WhatsApp Image 2022-11-22 at 05.45.13.jpeg"><br><img src="https://siasn.bkd.jatimprov.go.id:9000/public/da2f85660a7d478e93f848af1bbcb7d39b72f175_WhatsApp Image 2022-10-24 at 11.22.53.jpeg"><br><img src="https://siasn.bkd.jatimprov.go.id:9000/public/563ca4e2440838e31f9a13d589332b1d36b032c1_WhatsApp Image 2022-10-24 at 11.21.59.jpeg"><br><img src="https://siasn.bkd.jatimprov.go.id:9000/public/c4a53dbab0c072f1e1c78446fc53ba70eb5768ad_WhatsApp Image 2022-10-24 at 11.21.29.jpeg"><br><img src="https://siasn.bkd.jatimprov.go.id:9000/public/0fad37751742c1c8e1066f9d704a8a7c4e7a050c_WhatsApp Image 2022-10-24 at 11.21.07.jpeg"></p>	\N	NX0GQ	master|56548	110594523576593972208	2023-03-05 10:13:12.185107+07	2023-03-07 09:21:35.429+07	2023-03-06 12:47:28.918+07	2023-03-07 09:21:35.429+07	\N	\N	\N	2023-03-07 09:21:35.429	master|40	2023-03-05 17:19:20.238	SELESAI	\N	\N	Silahkan untuk berkoordinasi dengan BKD Kabupaten/Kota untuk	\N	terus bagaimana ya pak,apakah SK  saya sudah dalam proses pak?	t	\N	f	f	f	f	f
7a7d8965-7484-4fe1-b2f5-cb102ec8d92a	SIASN 	\N	<p>saya tidak bisa melakukan peremajaan data semuanya tentang ASN Tendik pendidik dan kependidikan PPPK </p>	\N	RQJKB	master|56543	master|19431	2023-03-08 08:50:35.064868+07	2023-03-09 15:08:28.322+07	2023-03-09 06:02:18.015+07	2023-03-09 15:08:28.322+07	\N	\N	\N	2023-03-09 15:08:28.322	master|40	2023-03-08 09:46:27.949	SELESAI	\N	SEDANG	bisa dikerjakan oleh verifikator dan approval\n	\N	saya dari sekolah  UPT SMA NEGERI 1 BATU 	t	13	f	f	f	f	f
48dcd28b-6f08-4173-a241-a628eaaed316	Surat Penilaian Kerja	\N	<p>Saya pegawai PTTPK Dinas Pendidikan Provinsi Jawa Timur. Yang ingin saya tanyakan. Mengapa saya masuk di penilaian kerja tercantum tulisan akun sedang diblokir. Padahal saya buka e master kok bisa. Akun sayapun juga sudah dipulihkan. Tapi diblokir saat masuk penilaian kinerja</p>	\N	Z1195	master|56543	118113011408094583493	2023-03-04 13:37:52.67349+07	2023-03-07 23:30:46.878+07	2023-03-07 05:05:41.216+07	2023-03-07 23:30:46.878+07	\N	\N	\N	2023-03-07 23:30:46.878	master|40	2023-03-05 17:18:10.77	SELESAI	\N	\N	apabila password salah bisa dilakukan reset password secara mandiri / bisa melalui fasilitator. Penilaian pttpk sudah terintegrasi dengan database pttpk	\N	\N	f	\N	f	f	f	f	f
d0804aaf-eed8-4111-ad43-8a7a9bf8422b	Pengajuan tingkat periode april 2023	\N	<p>Saya PNS dengan </p><p>Nama MUHAMMAD NURKHOLIS MAJID</p><p>NIP.198504102006041004</p><p>telah mengikuti proses kenaikan pangkat menuju golongan 3/c,periode april 2023. Cek notifikasi my SAPK,selalu muncul eror</p><p>Sampai dimana prosesnya sekarang ya,mengingat biasanya maret sudah terbit persetujuan BKN kanreg</p><p><br></p><p>Terima kasih</p><p><br></p><p><br></p><p><br></p>	\N	JU8MF	master|56548	103830938037949554523	2023-03-07 15:18:34.4346+07	2023-03-17 08:52:14.837+07	2023-03-08 08:53:51.281+07	2023-03-17 08:52:14.837+07	\N	\N	\N	2023-03-17 08:52:14.837	master|40	2023-03-07 21:23:12.465	SELESAI	\N	\N	Selalu berkoordinasi dengan pengelola kepegawaian instansi 	\N	\N	f	\N	f	f	f	f	f
afe0c694-b8ff-4b8a-b896-d7f0b9bff6f7	SIASN	\N	<p>bagaimana cara mengedit APLIKASI SIASN dan tutorialnya bagaiman?</p>	\N	EUHBX	master|40	master|19431	2023-03-08 08:52:48.091026+07	2023-03-09 14:15:32.037+07	2023-03-08 09:47:44.58+07	2023-03-09 14:15:32.037+07	\N	\N	\N	2023-03-09 14:15:32.037	master|40	2023-03-08 09:46:56.551	SELESAI	\N	SEDANG	Terimakasih jika masih ada kendala silhkan hub kembali	\N	\N	f	13	f	f	f	f	f
ca3c60f9-d7cc-4715-9598-ddcfa37a62a0	PPPK	\N	<p>Selamat sore...</p><p>Sesuai pengumuman penyesuaian jadwal pelaksanaan penerimaan PPPK, pengumuman daftar peserta dan tanggal ujian diumumkan tanggal 06 - 16 maret 2023. Apakah sudah ada? jika sudah ada dapat dilihat dimana?</p><p>Terima kasih</p>	\N	NO07L	master|40	pttpk|3655	2023-03-07 14:59:41.513689+07	2023-03-08 08:39:51.121+07	2023-03-07 21:23:44.523+07	2023-03-08 08:39:51.121+07	\N	\N	\N	2023-03-08 08:39:51.121	master|40	2023-03-07 21:22:48.183	SELESAI	\N	SEDANG	Selalu cek/update di website bkdjtaim utk jadwal per sesi. DUMP	\N	\N	f	12	f	f	f	f	f
33d0a4da-5ad9-4c2e-b0be-93c89673560a	MATERI PENGUATAN MENTAL ROHANI 	\N	<p>Selamat Pagi,</p><p>Saya peserta Penguatan Mental Rohani tanggal 9-10 Maret 2023. Seingat saya untuk materinya tersedia di web BKD. Nah, tepatnya di menu apa ya Kak?</p><p>Mohon infonya. Terimakasih</p>	\N	IB27V	master|58521	master|56814	2023-03-17 09:57:32.901816+07	2023-03-17 12:45:55.045+07	2023-03-17 12:45:20.409+07	2023-03-17 12:45:55.045+07	\N	\N	\N	2023-03-17 12:45:55.045	master|40	2023-03-17 10:11:59.074	SELESAI	\N	\N	materi penguatan mental rohani BKD jatim	\N	\N	f	\N	f	f	f	f	f
ad827c59-3c04-48b5-9881-8190ece7463e	KARSU	\N	<p>mohon maaf sebelumnya, mohon info untuk proses penerbitan KARSU, sudah berjalan sekitar 1 tahun tapi belum terbit. an. SAIDI, suami dari PNS an. SITI MARJANAH, NIP. 196708162006042010. Terima kasih sebelumnya</p><p><br></p>	\N	B6VFT	master|58521	104188047376455869619	2023-03-09 08:28:30.870578+07	2023-03-17 12:40:45.53+07	2023-03-17 12:40:45.53+07	\N	\N	\N	\N	\N	master|40	2023-03-09 09:05:51.513	DIKERJAKAN	\N	\N	\N	\N	\N	f	\N	f	f	f	f	f
615f5c9e-b37d-4052-b167-93905cf5126c	penyesuaian ijazah	\N	<p><strong>Selamat siang Bapak/Ibu</strong></p><p>Saya Diana Rosyida jabatan statistisi ahli pertama Bappeda Jatim.</p><p>Mohon maaf ada yang ingin saya tanyakan terkait penyesuaian ijazah.</p><p>Saya memiliki ijazah S2 Statistika dan lulus tanggal 22 mei 2019, sedangkan tmt cpns saya 1 maret 2019 dan spmt 1 mei 2019.</p><p>Apakah ijazah saya tersebut dapat diajukan untuk penyesuaia ijazah atau penyetaraan gelar atau yang lainnya? kalau dapat diajukan mohon informasi terkait persayaratan apa saja yang harus dipenuhi</p><p>Terimakasih</p>	\N	F4RXQ	master|56552	master|56590	2023-03-08 15:11:05.267218+07	2023-03-08 15:11:05.267218+07	\N	\N	\N	\N	\N	\N	master|40	2023-03-08 19:31:50.271	DIAJUKAN	\N	\N	\N	\N	\N	f	\N	f	f	f	f	f
7d3628c8-999f-4312-9b3e-5889aeb4b163	Peserta Ujian Dinas 	\N	<p>Apakah PNS dari kabupaten diluar Provinsi Jawa Timur bisa ikut serta dalam ujian dinas yang diselenggarakan BKD Prov. Jawa Timur ?</p><p>Kalau bisa bagaimana mekanismenya?</p><p>Terimakasih.</p>	\N	5HKGX	master|56553	105126464846449076179	2023-03-08 20:45:30.225337+07	2023-03-17 12:41:42.98+07	2023-03-09 18:20:20.602+07	2023-03-17 12:41:42.98+07	\N	\N	\N	2023-03-17 12:41:42.98	master|40	2023-03-09 09:06:38.112	SELESAI	\N	RENDAH	Koordinasi terlebih dahulu ke BKD/BKPSDM/Instansi Asal yang menangani kepegawaian untuk selanjutnya dapat dilakukan kerjasama dengan BKD Prov. Jatim terkait fasilitasi Ujian Dinas	\N	\N	f	14	f	f	f	f	f
4d8e8632-ab34-45e0-860a-3b0aa5c31de7	Pengumuman P3K Guru 2022	\N	<p>Assalamualaikum, Mohom di umumkan Hasil P3k Guru tahun 2023</p>	\N	P44T6	master|40	101142547976358374810	2023-03-08 17:37:14.016366+07	2023-03-09 14:16:04.288+07	2023-03-08 19:44:53.014+07	2023-03-09 14:16:04.288+07	\N	\N	\N	2023-03-09 14:16:04.288	master|40	2023-03-08 19:32:24.824	SELESAI	\N	SEDANG	Terimakasih jika masih ada kendala silhkan hub kembali	\N	\N	f	12	f	f	f	f	f
9ba97736-6c05-480e-8099-1bfc60554a34	LAPORAN	\N	<p>Mohon ijin lapor, pengumuman lokasi ujian untuk PPPK TEKNIS atas nama : NOVI MAULIDA RAHMAWATI S.PD</p><p>Nomer peserta : 2365743120000021</p><p>Kok tidak ada ya di pengumuman jadwal tes dan lokasi ujian? </p><p>Padahal di sscn dinyatakan lolos seleksi administrasi.</p><p>Mohon ditindaklanjuti</p><p>🙏🙏🙏</p><p>Terima kasih<br><img src="https://siasn.bkd.jatimprov.go.id:9000/public/b23d728e06d9e5e9953aaeae4bb35ff93c7886f3_Screenshot_20230309-123724_Drive.jpg"></p>	\N	LJQXS	master|40	113590622065689285619	2023-03-09 12:41:32.30793+07	2023-03-09 16:25:28.719+07	2023-03-09 16:24:07.517+07	2023-03-09 16:25:28.719+07	\N	\N	\N	2023-03-09 16:25:28.719	master|40	2023-03-09 15:02:05.135	SELESAI	\N	SEDANG	silahkan cek kembali di pengumuman	\N	\N	f	12	f	f	f	f	f
148abb4a-ff0f-4ffb-9bff-362b7d01f1b3	PENGUMUMAN PPPK	\N	<p>Kapan pengumuman PPPK di wilayah provinsi jawatimur?</p>	\N	BHIDY	master|40	100820938375550812284	2023-03-08 13:33:13.859252+07	2023-03-09 14:15:47.548+07	2023-03-08 19:38:19.404+07	2023-03-09 14:15:47.548+07	\N	\N	\N	2023-03-09 14:15:47.548	master|40	2023-03-08 19:30:57.298	SELESAI	\N	SEDANG	Terimakasih jika masih ada kendala silhkan hub kembali	\N	\N	f	12	f	f	f	f	f
3774e439-f48d-465a-a8f0-a7827874ded9	PPPK Guru	\N	<p>selamat siang.</p><p><br></p><p>perkenalkan saya arif devit dari probolinggo.</p><p>saat ini saya guru swasta dengan status pppk prioritas 1 (P1)</p><p>tetapi saya belum mendapat penempatan.</p><p>apakah ada tambahan formasi pppk guru, khususnya P1?</p>	\N	FLM1S	master|40	112930744005332427012	2023-03-08 14:36:26.443382+07	2023-03-09 14:15:56.166+07	2023-03-08 19:42:34.537+07	2023-03-09 14:15:56.166+07	\N	\N	\N	2023-03-09 14:15:56.166	master|40	2023-03-08 19:31:18.302	SELESAI	\N	SEDANG	Terimakasih jika masih ada kendala silhkan hub kembali	\N	\N	f	12	f	f	f	f	f
67bfa502-7631-4811-85a0-fd8462aee3b8	Pengumuman sscasn	\N	<p>Min , izin bertanya. Pengumuman p3k  jf guru wilayah jawatimur kapan di umumkan..?</p><p>Terima kasih</p>	\N	R43IT	master|40	109993441263825023282	2023-03-08 15:40:06.251078+07	2023-03-09 14:16:15.567+07	2023-03-08 19:45:31.541+07	2023-03-09 14:16:15.567+07	\N	\N	\N	2023-03-09 14:16:15.567	master|40	2023-03-08 19:32:08.365	SELESAI	\N	SEDANG	Terimakasih jika masih ada kendala silhkan hub kembali	\N	\N	f	12	f	f	f	f	f
7dc1acc0-77f8-4ec0-8132-54acf8b7cda3	Rekrutmen PPPK 	\N	<p>Bapak ibu admin. Mohon maaf bertanya.</p><p>Kebetulan saya Termasuk PG 2021, P1 dr sekolah swasta. Namun di sscan keterangan tidak ada formasi penempatan. Pertanyaannya;</p><p>1. Untuk bisa ikut perekrutan ASN guru tahun 2022 apakah saya harus turun prioritas 4/UMUM. </p><p>2. jika turun diprioritas 4/umum apa dijamin ada kuota yang tersisa untuk diperebutkan. Mengingat masih ada prioritas 2 dan 3 diatas prioritas UMUM.</p><p><br></p><p>3. JIKA SDH TURUN PRIORITAS UMUM. Kedepannya jika tahun 2023 ada perekrutan ASN apa tidak bisa berubah lagi menjadi prioritas 1.</p><p> MOHON JAWABANNYA BAPAK IBU. TERIMA KASIH</p>	\N	LGQGK	master|40	110270258097436281823	2022-11-12 11:08:20.394521+07	2023-03-02 05:26:45.297+07	2022-11-13 23:18:34.297+07	2023-03-02 05:26:45.297+07	\N	\N	\N	2023-03-02 05:26:45.297	master|40	2022-11-12 18:21:52.206	SELESAI	\N	SEDANG	terimakasih	\N	\N	f	12	f	f	f	f	f
6239be5a-bae8-42f3-8ef6-5ca9af20874d	laman sscn akun saya tidak bisa digunakan untuk mengecek penempatan saya dalam formasi PPPK 	\N	<p>laman sscn akun saya tidak bisa digunakan untuk mengecek penempatan saya dalam formasi PPPK, saya bisa memperoleh file peserta yang lolos PPPK Pemprov Jatim untuk formasi guru agama Islam di mana ya?</p>	\N	9PPGG	master|40	111128017015886258179	2023-03-08 21:53:02.939287+07	2023-03-09 16:25:58.106+07	2023-03-09 14:13:20.988+07	2023-03-09 16:25:58.106+07	\N	\N	\N	2023-03-09 16:25:58.106	master|40	2023-03-09 09:06:17.148	SELESAI	\N	SEDANG	triamaksih sudah bertanya di helpdesk BKD Jatim	\N	\N	f	12	f	f	f	f	f
4b0cf16b-4ba7-4ab5-9319-7d3904ffb336	Syarat dan Alur Mutasi	\N	<p>Selamat pagi, saya Andi Reski Batari, PNS Daerah yang bertugas di RSUD Soetomo. Saya ingin menanyakan perihal syarat dan berkas apa saja yang dibutuhkan untuk mengajukan mutasi ke Provinsi lain. Jika memang ada persyaratan berkas, apakah disediakan formatnya (bisa diunduh) ataukah bagaimana? </p><p>Terima kasih. </p>	\N	SJO14	master|56548	master|57561	2023-03-10 07:11:34.778147+07	2023-03-17 09:16:10.843+07	2023-03-17 09:13:44.565+07	2023-03-17 09:16:10.843+07	\N	\N	\N	2023-03-17 09:16:10.843	master|40	2023-03-10 09:37:34.033	SELESAI	\N	\N	Silahkan berkoordinasi dengan Pengelola Kepegawaian RSUD Dr. Soetomo lebih lanjut	\N	\N	f	\N	f	f	f	f	f
8b148afe-07d2-40c9-92bc-674b04106a5b	Formasi yang jauh dari domisili	\N	<p>Pak mohon maaf izin tanya sekali lagi. Ini untuk lokasi penempatan kok berubah jauh, sekolah induk saya di smkn 1 bringin kab ngawi kok sekarang malah penempatan di smkn 2 kraksaan kab probolinggo.</p><p>Padahal Di sekolah induk juga membuka formasi untuk jurusan yang saya lamar.</p><p>Mohon infonya pak</p><p>Terima kasih</p>	\N	T8Z3H	master|88	109993441263825023282	2023-03-09 19:47:11.865409+07	2023-03-10 10:03:55.069+07	2023-03-10 09:59:13.84+07	2023-03-10 10:00:01.336+07	\N	\N	\N	2023-03-10 10:00:01.336	master|40	2023-03-10 09:49:30.977	SELESAI	\N	RENDAH	ok	\N	\N	f	12	f	f	f	f	f
6ae61b89-c4f8-4767-8d57-a67c8f61116c	SK JABFUNG DAN PENGERJAAN DUPAK	\N	<p>Assalamualaikum. Selamat pagi pak, mohon bertanya karna lagi beredar isu bahwa nanti penerimaan SK PNS dan Sumpah PNS dibarengi dengan SK Jabfung apakah benar? Dan di ig kemenpan rb bahwa jabfung tidak lagi mengerjakan dupak itu apa benar dan dimulai kapan nggih pak?</p><p>Terimakasih. Mohon arahannya nggih pak 🙏🏻 </p>	\N	S9YTZ	master|56548	108063347615393395047	2023-03-09 10:30:20.760797+07	2023-03-17 09:09:11.763+07	2023-03-17 09:04:28.721+07	2023-03-17 09:09:11.763+07	\N	\N	\N	2023-03-17 09:09:11.763	master|40	2023-03-09 15:01:28.532	SELESAI	\N	\N	Terima kasih sudah menggunakan layanan Helpdesk BKD Provinsi Jawa Timur	\N	\N	f	\N	f	f	f	f	f
e5c9f453-832c-48d8-ba4b-e790d8dcb646	Pelaksanaan Penyesuain Ijasah dan Ujian Dinas Tahun 2023 	\N	<p>Kapan pelaksanaan Penyesuaian Ijasah dilaksanakan untuk tahun 2023</p><p>mhn arahan.... btk</p>	\N	6LSZJ	master|56552	111168556735900934745	2023-03-10 20:57:47.099816+07	2023-03-10 20:57:47.099816+07	\N	\N	\N	\N	\N	\N	master|40	2023-03-13 21:35:48.622	DIAJUKAN	\N	\N	\N	\N	\N	f	\N	f	f	f	f	f
092689ec-bede-4f57-b064-8ea8a8a5fa8e	Tentang TPP pegawai mutasi baru 	\N	<p>Selamat Pagi, saya sedang dlm proses mutasi dari Pemkab ke Pemprov Jatim sejak Juni kemarin, saya ingin menanyakan pergub baru ttg pegawai yg mutasi di provinsi Jatim tdk mendapat TPP selama 1 thn, perkecualian guru. Bagaimana dg nakes khususnya Dokter spesialis konsultan ya? Krn keahlian saya dibutuhkan di salah satu RS pemprov Jatim </p><p>Trims atas penjelasannya</p><p>dr Etty Fitria Ruliatna, SpMK (K)</p>	\N	S2JQX	master|58521	100223887765725236648	2023-03-13 08:31:07.717876+07	2023-03-17 12:52:36.512+07	2023-03-17 12:52:36.512+07	\N	\N	\N	\N	\N	master|40	2023-03-13 21:37:16.209	DIKERJAKAN	\N	\N	\N	\N	\N	f	\N	f	f	f	f	f
56c68b7c-4147-4a39-8a28-6d746f3d3b1e	Kenapa P1 Guru Swasta tidak ada penempatan 	\N	<ul><li><br></li></ul>	\N	TFUEW	master|88	113567613428615339336	2023-03-10 22:33:29.401562+07	2023-03-17 20:48:38.462+07	2023-03-17 20:48:38.462+07	\N	\N	\N	\N	\N	master|40	2023-03-13 21:36:04.488	DIKERJAKAN	\N	\N	\N	\N	\N	f	\N	f	f	f	f	f
51e8c056-0de2-4ead-b72b-d0d04c3beb11	PENEMPATAN PPPK TAHUN 2022	\N	<p>Selamat Siang </p><p>Saya Hendro Suryono mau menanyakan apakah PPPK Guru Boleh Sanggah / Keberatan Penempatan Unit Kerja Baru karena jarak dengan domisili terlalu jauh dengan unit kerja yang baru, serta tidak ada nya dan sulitnya akses akomodasi transportasi umum menuju ke lokasi unit kerja baru sehingga kesulitan menuju ke lokasi lembaga sekolah tersebut dikarena daerah khusus ( Daerah Pegunungan )</p><p>Mohon Kebijakan dari bapak/ibu kepala BKD PROV. JATIM akan permasalahan yang terjadi di PPPK 2022 </p><p>Atas Perhatiannya saya ucapkan mohon maaf dan terima kasih.</p>	\N	0HHCZ	master|49741	104052548613068363671	2023-03-14 12:43:19.868781+07	2023-03-15 09:20:05.209+07	2023-03-15 09:20:05.209+07	\N	\N	\N	\N	\N	master|56543	2023-03-15 09:19:30.197	DIKERJAKAN	\N	\N	\N	\N	\N	f	\N	f	f	f	f	f
86d183bd-a333-4bcc-b929-16197c6f4093	Tanya tentang mutasi	\N	<p>Ijin bertanya min jika PNS Pemprov Jawa timur ingin pindah menjadi PNS kabupaten kota di Jawa timur sulit tidak ya min..apa harus menunggu 10 tahun sesuai dengan SK pengangkatan pns</p>	\N	39E5Z	master|56548	116884065911676631095	2023-03-11 20:32:07.287655+07	2023-03-17 09:19:20.11+07	2023-03-17 09:16:30.629+07	2023-03-17 09:19:20.11+07	\N	\N	\N	2023-03-17 09:19:20.11	master|40	2023-03-13 21:36:34.489	SELESAI	\N	\N	Terima kasih, dan silahkan untuk berkoordinasi dahulu dengan pengelola kepegawian instansi	\N	\N	f	\N	f	f	f	f	f
20c77117-1d82-49d3-ac5c-ef6798b47620	Memohon petunjuk untuk bisa mutasi sebagai guru SMK!	\N	<p>Selamat Siang!</p><p>Ijin berkonsultasi untuk keperluan mutasi sebagai guru SMK, bagaimana petunjuknya untuk bisa mutasi dari SMK antar Kabupaten dalam Porvinsi Jawa Timur! </p><p>Terimaksih sebelumnya!</p>	\N	6T2MF	master|56548	115336653648009478118	2023-03-19 13:38:54.393644+07	2023-03-21 08:56:13.146+07	2023-03-21 08:53:13.615+07	2023-03-21 08:56:13.146+07	\N	\N	\N	2023-03-21 08:56:13.146	master|40	2023-03-20 17:24:55.96	SELESAI	\N	\N	Silahkan untuk berkonsultasi dengan pengelola kepegawaian instansi terlebih dahulu untuk kelengkapa berkas dan persyaratan	\N	\N	f	\N	f	f	f	f	f
9c88fcbf-23a0-47a3-bfa3-1f520a8380a7	Berapa Upah Minimum pekerja perusahaan yang sebenarnya?	\N	<p>Selamat Pagi, saya ingin menanyakan apakah Upah Minimum berlaku untuk dilaksanakan oleh seluruh perusahaan terdaftar di Indonesia? Lalu bagaimana jika pekerja mendapat upah/gaji kurang dari upah minimum yang ditetapkan? Apa tidak ada yang bisa saya lakukan?</p>	\N	9IDWC	master|88	100597502092332672020	2023-03-16 10:34:43.483867+07	2023-03-17 20:58:10.812+07	2023-03-17 20:58:10.812+07	\N	\N	\N	\N	\N	master|40	2023-03-16 13:46:13.328	DIKERJAKAN	\N	\N	\N	\N	\N	f	\N	f	f	f	f	f
86c86e49-4394-4450-ae42-9b9be7df1090	PENGISIAN DRH TIDAK BISA	\N	<p><u>selamat siang ijin menyampaikan saya mendapat informasi bahwa saya menjadi pengganti penerimaan pppk nakes tetapi hingga saat ini saya tidak bisa mengisi DRH mohon arahannya terimakaish</u></p>	\N	PAOEV	master|88	111621747819290560388	2023-03-11 13:54:07.363632+07	2023-03-17 20:58:40.058+07	2023-03-17 20:58:40.058+07	\N	\N	\N	\N	\N	master|40	2023-03-13 21:36:21.187	DIKERJAKAN	\N	\N	\N	\N	\N	f	\N	f	f	f	f	f
7590641b-e743-414e-b232-d80524fda2d5	mohon alamat bkd 	\N	<p>Saya Pak Karnadi, staf DitPPG GTK kemdikbud, sudah berkirim surat undangan seminar di Unessa Surabaya. Saya mohon kontak person Kantor BKD Malang, Sidoarjo, Gresik, Bangkalan, Batu, Jember, Madiun, Mojokerto, Lamongan, Malang, Surabaya</p>	\N	DVWHJ	master|40	111511155205878625323	2023-03-17 14:17:41.499784+07	2023-03-18 06:45:34.792+07	2023-03-18 06:28:42.947+07	2023-03-18 06:45:34.792+07	\N	\N	\N	2023-03-18 06:45:34.792	master|40	2023-03-18 06:22:23.871	SELESAI	\N	SEDANG	terimakasih tas kunjungan di aplikasi helpdesk bkdjatim	\N	\N	f	14	f	f	f	f	f
3435d1f6-195c-4be4-8799-05528090671d	CP	\N	<p>Assalamualaikum WR Yth Bapak /ibu, mohon ijin mengganggu, dalam rangka seminar pendidikan di UNESA hari Senin 20 Maret 2023, kami hendak mengundang Bapak sekda Provinsi Jatim dan&nbsp;kepala BKD propinsi Jatim apakah kami bisa dapat no hp staf atau sespri kepala BKD, terimakasih sebelumnya</p>	\N	EHJSG	master|40	106421360554716345525	2023-03-17 14:01:02.419312+07	2023-03-18 06:28:15.511+07	2023-03-18 06:24:52.13+07	2023-03-18 06:28:15.511+07	\N	\N	\N	2023-03-18 06:28:15.511	master|40	2023-03-18 06:22:43.269	SELESAI	\N	SEDANG	terimakasih atas kunjungan ke portal helpdesk BKD Jatim	\N	\N	f	14	f	f	f	f	f
6d9dcd44-69e6-4228-94ee-671f1e309247	Informasi beasiswa	\N	<p>Kapan pendaftaran beasiswa dibuka? Dan apa saja persyaratannya?</p>	\N	EMVIR	master|56553	111613221740802737569	2023-03-12 09:05:45.009707+07	2023-03-21 16:49:13.678+07	2023-03-17 12:42:30.952+07	2023-03-21 16:49:13.678+07	\N	\N	\N	2023-03-21 16:49:13.678	master|40	2023-03-13 21:36:53.289	SELESAI	\N	RENDAH	Informasi selengkapnya terkait beasiswa dapat diakses melalui website BKD Prov. Jatim https://bkd.jatimprov.go.id/ 	\N	\N	f	14	f	f	f	f	f
8ca24bf8-5dfd-4991-9716-173e7f4a18ab	Barcode ttd kepala badan kepegawaian provinsi menindih nama 	\N	<p>Barcode TTD bu indah pada SK PNS menindih nama bu indah wahyuni . Jadi namanya tidak kelihatan<br><img src="https://siasn.bkd.jatimprov.go.id:9000/public/b54869b844d3c8367b640e99a4caac44ff446f70_IMG-20230317-WA0008.jpg"></p>	\N	YLJVR	master|88	master|62279	2023-03-18 21:27:23.767287+07	2023-03-18 21:27:23.767287+07	\N	\N	\N	\N	\N	\N	master|40	2023-03-20 17:25:31.673	DIAJUKAN	\N	\N	\N	\N	\N	f	\N	f	f	f	f	f
46ea028b-2f65-4fe2-a748-ac6a25252180	Mutasi Guru dari Provinsi Luar Jawa Timur	\N	<p>Salam,</p><p>perkenalkan saya Agtisda T. Silalahi. Saya guru Bahasa Inggris di SMK Negeri 3 Manokwari. Saya ingin berkonsultasi soal mutasi Guru dari luar Prov. Jawa Timur. Apakah betul untuk mengajukan mutasi, saya harus menemukan terlebih dahulu sekolah yang membutuhkan mata pelajaran yang saya ampu? </p><p>Terima kasih.</p>	\N	328CK	master|56548	114189413630166937544	2023-03-18 17:32:08.476708+07	2023-03-21 08:58:44.206+07	2023-03-21 08:56:26.088+07	2023-03-21 08:58:44.206+07	\N	\N	\N	2023-03-21 08:58:44.206	master|40	2023-03-20 17:25:49.651	SELESAI	\N	\N	Silahkan berkonsultasi dengan pengelola kepegawaian Instansi asal terlebih dahulu	\N	\N	f	\N	f	f	f	f	f
cd2a9f72-4b17-40b4-9aa9-a3aed6c71ae3	LEGALISIR IZIN BELAJAR	\N	<p>Apakah BKD Jatim menyediakan layanan legalisir online?</p><p>Apakah layanan legalisir BIRO ORGANISASI SETDA PROV JATIM ini dapat saya gunakan untuk melakukan legalisir online? Jika bisa, biro yang saya pilih biro apa? Saya guru dari cabdin Jombang. Terima kasih</p>	\N	NK2WM	master|56553	114271680703150740327	2023-03-16 16:17:35.168807+07	2023-03-21 16:43:08.355+07	2023-03-17 12:45:41.624+07	2023-03-21 16:43:08.355+07	\N	\N	\N	2023-03-21 16:43:08.355	master|40	2023-03-17 10:12:55.766	SELESAI	\N	RENDAH	Legalisir masih dilakukan secara manual di kantor BKD Prov. Jatim	\N	\N	f	14	f	f	f	f	f
3b12d29e-ce1a-4fb8-9548-6bb7fbb89c75	Pertanyaan Penempatan PPPK Guru SMK	\N	<p>Assalamu'alaikum</p><p>Selamat siang bapak/ibu BKD Provinsi Jawa Timur, nama saya M. Nur Muharrom yang lolos dan mendapatkan penempatan PPPK Guru Manajemen Perkantoran Tahun 2022 di SMK Negeri Sekar Kabupaten Bojonegoro.</p><p>Sehingga setelah mendapatkan pengumuman tersebut saya langsung mengkonfirmasi sekolah, dan ternyata di SMKN Sekar untuk guru pada jurusan tersebut sudah penuh dan lebih satu, dimana guru di sekolah tersebut sudah bersatatus ASN dan PPPK serta sudah bersertifikat Pendidik. </p><p>Sehingga saya berfikir di sekolah tersebut tentu saya tidak akan kebagian jam mengajar, mengingat guru yang ada saat ini sudah lebih, sebelumnya saya mendaftar PPPK untuk formasi <span style="color: rgb(44, 47, 52);">Jurusan Otomasi Tata Kelola Administrasi Perkantoran</span> di SMKN 1 Bojonegoro yang mana pada saat itu ada 2 formasi, dan saat pengumuman penempatan PPPK tahun ini juga di SMKN 1 Bojonegoro belum terisi, sehingga alangka bermanfaatnya apabila saya bisa ditempatkan di sekolah yang membang menbutuhkan tenaga guru.</p><p>Terima Kasih</p><p>Assalamu'alaikum</p>	\N	7BR2I	master|88	100154973142512312770	2023-03-10 12:45:06.307762+07	2023-03-15 09:45:43.29+07	2023-03-15 09:38:38.61+07	2023-03-15 09:45:43.29+07	\N	\N	\N	2023-03-15 09:45:43.29	master|40	2023-03-10 16:06:58.969	SELESAI	\N	TINGGI	lihat di web bkd	\N	\N	f	12	f	f	f	f	f
7296931e-869c-4c2d-94d8-b06d27f0f8c2	SIASN saya tidak bisa	\N	<p>test 123</p>	\N	84K95	master|56543	master|88	2023-03-15 09:46:11.823219+07	2023-03-15 09:47:24.079+07	2023-03-15 09:46:52.885+07	2023-03-15 09:47:24.079+07	\N	\N	\N	2023-03-15 09:47:24.079	master|56543	2023-03-15 09:46:44.493	SELESAI	\N	\N	test	3	oke sekali	t	\N	f	f	f	f	f
e856b9ab-a118-42c4-b30c-a77872f22163	SKP UNTUK PNS TUGAS BELAJAR	\N	<p>Assalamualaikum Warohmatullah Wabarokhatu </p><p>Bapak/Ibu Mohon ijin tanya terkiat bagaimana pembuatan SKP di akun E-Master untuk Guru PNS yang mendapat Tugas Belajar Pendidikan S2 ? </p><p>mohon arahanya dan bimbinganya. Terimakasih</p>	\N	KHB58	master|58521	master|58237	2023-03-15 12:42:38.095297+07	2023-03-15 12:42:38.095297+07	\N	\N	\N	\N	\N	\N	master|40	2023-03-16 13:47:22.915	DIAJUKAN	\N	\N	\N	\N	\N	f	\N	f	f	f	f	f
f2a160ca-6794-4872-80ee-0d92a2f20dfc	Syarat, ketentuan, dan penjelasan masalah TPP untuk PNS Kementerian yang mutasi ke Pemprov Jatim	\N	<p>Saya PNS Kemenpora, bermaksud untuk mengajukan mutasi ke Pemprov jatim dikarenakan ingin menemani Ibu saya di kampung yang tinggal sendirian dan sudah tua. Mohon arahan terkait syarat, ketentuan dan TPP. Krn yg saya baca, TPP tidak diberikan pd tahun pertama. Bahkan, tahun ke dua s.d. ke lima hanya 30%. Terimakasih</p>	\N	1MJTA	master|58521	110556506252010760909	2023-03-16 09:50:00.908031+07	2023-03-16 09:50:00.908031+07	\N	\N	\N	\N	\N	\N	master|40	2023-03-16 13:46:40.94	DIAJUKAN	\N	\N	\N	\N	\N	f	\N	f	f	f	f	f
f2c8782a-69ba-4d41-b83d-de1b4e1e6f88	PERSYARATAN SURAT IJIN BELAJAR	\N	<p>Assalamualaikum wr.wb. bapak/ibu yang sy hormati, ijin bertanya berkaitan tentang surat ijin belajar. Untuk poin formulir pengajuan surat ijin belajar, dari manakah saya bisa mendapatkan formulir tersebut? Terimakasih</p>	\N	MLX3R	master|56552	master|10593	2023-03-16 07:47:50.492611+07	2023-03-16 07:47:50.492611+07	\N	\N	\N	\N	\N	\N	master|40	2023-03-16 13:47:04.526	DIAJUKAN	\N	\N	\N	\N	\N	f	\N	f	f	f	f	f
a0a46955-550a-4eaa-b8c6-50cf157f32ce	SKP UNTUK PNS TUGAS BELAJAR	\N	<p>Assalamualaikum Warohmatullah Wabarokhatu </p><p>Bapak/Ibu Mohon ijin tanya terkiat bagaimana pembuatan SKP di akun E-Master untuk Guru PNS yang mendapat Tugas Belajar Pendidikan S2 ? </p><p>mohon arahanya dan bimbinganya. Terimakasih</p>	\N	5G534	master|42	master|58237	2023-03-15 12:42:36.535866+07	2023-03-15 12:42:36.535866+07	\N	\N	\N	\N	\N	\N	master|40	2023-03-16 13:47:38.939	DIAJUKAN	\N	\N	\N	\N	\N	f	\N	f	f	f	f	f
6e169dcd-ec24-45d4-9e0e-b94fa4f3865d	Mutasi Pegawai ke Inspektorat Daerah Prov Jawa Timur 	\N	<p>Izin bertanya berkaitan Mutasi Ke Pemprov Jawa Timur itu apa saja ya ?  Dan bagaimana mengetahui apakah tersedia tempat untuk Instansi Tujuan kita nanti , Serta Persyaratan yang diperlukan untuk Pindah Instansi. Terimakasih </p>	\N	H6OUD	master|56548	102394307718819695325	2023-03-15 10:51:46.747439+07	2023-03-17 09:20:38.22+07	2023-03-17 09:19:32.279+07	2023-03-17 09:20:38.22+07	\N	\N	\N	2023-03-17 09:20:38.22	master|40	2023-03-16 13:47:55.807	SELESAI	\N	\N	Sebelumnya juga dapat koordinasi dahulu dengan pengelola kepegawaian instansi atau BKD asal \n\nTerima kasih,	\N	\N	f	\N	f	f	f	f	f
9c8ee129-5a6f-4f42-a877-24ac49c19578	SK Pensiun ( BUP )	\N	<p>Mohon Ijin bertanya tentang :</p><p>SK Pensiun BUP <strong>1 September 2023</strong> atas nama :</p><p><strong>RADEN AGUS TEGUH WIDODO</strong></p><p>Penata Muda Tk. I,  III / b</p><p>NIP.  19650821 198603 1 013 / 131 600 345</p>	\N	9VA3K	master|56548	109485237600040517247	2023-03-08 10:55:02.512019+07	2023-03-17 08:51:23.509+07	2023-03-17 08:48:42.825+07	2023-03-17 08:51:23.509+07	\N	\N	\N	2023-03-17 08:51:23.509	master|40	2023-03-08 19:29:34.857	SELESAI	\N	\N	Dimohon untuk menunggu proses Pensiun BUP dan tetap berkoordinasi dengan pengelola kepegawaian instansi	\N	\N	f	\N	f	f	f	f	f
a8cedb92-5b54-4f6d-8da2-506222c2d6e9	Mohon bantuan Update data PMK dan Pangkat Terakhir revisi perbaikan masa kerja pada MySAPK	\N	<p>Assalamu'alaikum wr. wb.</p><p>Yth. Admin BKD Provinsi Jawa Timur</p><p>Mohon dibantu untuk updating data pada MySAPK BKN terkait:</p><p>1.Peninjauan Masa Kerja</p><p>2.Pangkat III/C dengan revisi perbaikan masa kerja</p><p><br></p><p>Terima kasih atas bantuannya.</p><p>Wassalamu'alaikum wr. wb.</p><p><br></p><p>Data Peninjauan Masa Kerja pada MySAPK BKN masih kosong:</p><p><br></p><p><br><img src="https://siasn.bkd.jatimprov.go.id:9000/public/24891eb6a507232a64e4eee48077c26c302a0589_riwayat pmk.jpg">Data Pangkat III/C pada MySAPK BKN dengan Masa Kerja belum revisi perbaikan seperti Master BKD Prov. Jatim :</p><p><br></p><p><br><img src="https://siasn.bkd.jatimprov.go.id:9000/public/50f9ded879d13b1c11366a3de111d0434c682409_riwayat pangkat.jpg"></p><p><br></p><p>SK Peninjauan Masa Kerja:</p><p><br></p><p><br><img src="https://siasn.bkd.jatimprov.go.id:9000/public/3074d96797e59c04b05f51f328aa0fc61658a3db_PMK.jpg">SK Pangkat III/C :</p><p><br></p><p><br><img src="https://siasn.bkd.jatimprov.go.id:9000/public/9c3105320d829315efdb6c90b4ca817d1806ed6f_3C.jpg"></p>	\N	41NYQ	master|56548	master|34625	2023-03-13 10:05:07.896163+07	2023-03-17 08:57:39.29+07	2023-03-17 08:55:08.399+07	2023-03-17 08:57:39.29+07	\N	\N	\N	2023-03-17 08:57:39.29	master|56543	2023-03-13 15:28:26.565	SELESAI	\N	\N	Selalu berkoordinasi dan menghubungi pengelola kepegawaian instansi	\N	\N	f	\N	f	f	f	f	f
79c43cf9-736c-4b9c-a5b7-b2bec03e9805	Permohonan CTLN	\N	<p>Selamat Pagi perkenalkan saya Dimas Ridho staff kepegawaian RSUD Husada Prima</p><p>Mohon izin bertanya , ada pegawai kami yang akan mengajukan Cuti Di Luar Tanggungan Negara, berkas sudah kami usulkan di EMaster. Untuk hardcopy nya apa perlu di kirim ke BKD njih? Dan apa ada nomor yg bisa dihubungi terkait pengajuan CTLN?</p><p>Mohon arahannya, terima kaish</p>	\N	4Q0DM	master|58521	pttpk|11678	2023-03-17 10:33:41.996916+07	2023-03-17 10:33:41.996916+07	\N	\N	\N	\N	\N	\N	master|40	2023-03-18 06:23:06.482	DIAJUKAN	\N	\N	\N	\N	\N	f	\N	f	f	f	f	f
7a1cb5d3-82f4-4c56-ae6f-ddebdc4fd4b5	Apakah tahun 2023 ini ada rekrutan CPNS nakes di Pemprov  Jatim?	\N	<p>Mau bertanya apakah pada tahun ini ada rekrutan untuk cpns nakes, atau nakes hanya p3k aja.</p>	\N	P4XOS	master|40	114071498507663116224	2023-03-18 08:30:23.697354+07	2023-03-20 17:31:56.393+07	2023-03-20 17:30:10.793+07	2023-03-20 17:31:56.393+07	\N	\N	\N	2023-03-20 17:31:56.393	master|40	2023-03-20 17:26:30.203	SELESAI	\N	\N	Terimakasih sudah menghubungi BKD Jatim.	\N	\N	f	\N	f	f	f	f	f
f66debb2-d835-4bdf-882f-b4d1c1519335	Progres Tindak Lanjut Berkas Pengakuan Masa Kerja	\N	<p>Assalamu'alaikum Warahmatullohi Wabarokatuh 🙏🙏🙏 </p><p>.</p><p>Saya Luluk Nurhamidah, ASN dari unit kerja SMA Ngunut, Kabupaten Tulungagung. Sekitar Bulan September 2021 Saya mengajukan berkas Pengakuan Masa Kerja berdasarkan SK GTY selama 6 tahun tanpa terputus melalui Cabdin Pendidikan Kabupaten Tulungagung. Mohon informasi tindak lanjut terhadap berkas Saya sudah sampai tahap apa atau jika masih antri menunggu untuk diproses, Berkas Saya sudah sampai di nomor berapa?. Informasi sementara yang Saya dapatkan dari Cabdin Pendidikan Kabupaten Tulungagung hanya sebatas saran untuk "Menunggu dengan sabar". </p><p>Terimakasih banyak,</p><p>Wassalamualaikum Wr. Wb</p>	\N	04M25	master|56548	106221904072757493129	2023-03-10 22:17:30.515323+07	2023-03-17 09:00:40.579+07	2023-03-17 08:58:27.675+07	2023-03-17 09:00:40.579+07	\N	\N	\N	2023-03-17 09:00:40.579	master|56543	2023-03-13 15:28:36.993	SELESAI	\N	\N	Silahkan menghubungi bidang Mutasi BKD Provinis Jawa Timur atau WA Center BKD 	\N	Saya masih terkendala dalam mengakses kontak WA center bidang mutasi, mohon bantuannya,,	t	\N	f	f	f	f	f
89f8231e-251a-4bfb-9079-5bde4a3983d8	Pertanyaan izin belajar	\N	<p>Selamat siang , saya Winda mau bertanya . Apa syarat untuk izin belajar ? Saya cpns 2022 kapan boleh mengajukan izin belajar ?Bagaimana kalau di instansi saya tidak ada formasi untuk sekolah yg akan saya lanjutkan ?</p><p>Terimakasih</p>	\N	IB7NG	master|56553	master|61550	2023-03-18 13:14:32.769764+07	2023-03-21 16:30:26.2+07	2023-03-21 16:30:26.2+07	\N	\N	\N	\N	\N	master|40	2023-03-20 17:26:11.182	DIKERJAKAN	\N	SEDANG	\N	\N	\N	f	14	f	f	f	f	f
33c33ea2-9129-4425-921f-004fe4249144	Pengisian SKP ASN Guru di Emaster BKD jatim	\N	<p>Assalamualaikum, selamat Pagi</p><p>Perkenalkan nama saya Wahyu Prasetyo Wibowo, S.Pd Guru SMAN 1 Taruna Madani Jatim. ingin menanyakan kapan mulai dilakukan pengisian SKP ASN Guru di emaster BKD Jatim dan kapan berakhirnya. terima kasih </p>	\N	L2JR9	master|58521	112926396832921719911	2023-03-20 09:00:34.615059+07	2023-03-20 09:00:34.615059+07	\N	\N	\N	\N	\N	\N	master|40	2023-03-20 17:24:31.062	DIAJUKAN	\N	\N	\N	\N	\N	f	\N	f	f	f	f	f
ae07d885-ea09-49a5-806c-46661c2991f6	Perbaruan PAK yang kadaluarsa	\N	<p>Assalamualaikum wr.wb </p><p>Perkenalkan saya Erna Sulistiyan (ASN 2019 dari SMKN 2 Boyolangu Tulungagung) Pada tahun 2020 sy mengajukan PAK Dasar namun pd saat itu sy blm memiliki Serdik. Pada saat ini sya sudah memiliki file serdik lulus pada Desember 2022. Bagaimana cara pengajuan perbaruan PAK Dasar yang  kadaluarsa masanya? Agar selanjutnya sya bisa mengajukan Jabfung dan kenaikan tingkat. </p><p>Mohon arahan langkah yang harus saya lakukan utk pengurusan hal tersebut.</p><p>Terimakasih banyak </p><p><br></p><p>Wassalamualaikum wr.wb </p><p><br></p><p>Hormat Kami Erna Sulistiyan </p><p>081 217 410 546  </p><p><br></p><p><br></p>	\N	YANZL	master|56545	master|58318	2023-03-05 04:32:48.881749+07	2023-03-21 16:47:36.26+07	2023-03-21 16:46:14.121+07	2023-03-21 16:47:36.26+07	\N	\N	\N	2023-03-21 16:47:36.26	master|40	2023-03-05 17:18:44.011	SELESAI	\N	\N	PAK menghubungi GTK Dindik	\N	\N	f	\N	f	f	f	f	f
1f19ec10-c053-4614-96c5-c1c57746ac66	Syarat pengisian DRH	\N	<p>mohon maaf izin bertanya, apa benar untuk mengurus persyaratan pengisiian DRH harus di urus tertanggal jadwal pengisian DRH? Jika benar bagaimana dengan yang sudah terlanjur mengurus surat SKCK, NAPZA, beberapa teman sudah mulai mengurus per hari ini, mohon pencerahannya terima kasih..</p>	\N	FUJYH	master|88	109993441263825023282	2023-03-20 20:41:36.894449+07	2023-03-20 20:41:36.894449+07	\N	\N	\N	\N	\N	\N	master|40	2023-03-21 09:36:21.419	DIAJUKAN	\N	\N	\N	\N	\N	f	\N	f	f	f	f	f
0173d681-6f30-48f4-8aff-737116bdfa02	Ijin Belajar	\N	<p>Selamat Siang, </p><p>Saya mau menanyakan tentang tentang Ijin Belajar,</p><ol><li>Alurnya seperti apa?</li><li>Berkas Kelengkapannya apa saja?</li><li>Prosesnya berapa hari setelah berkas diterima dengan lengkap?</li></ol><p>Terimakasih informasinya. 🙏🏼</p>	\N	SIBF0	master|56553	master|62077	2023-03-17 15:30:42.06759+07	2023-03-21 16:47:47.427+07	2023-03-20 14:13:44.146+07	2023-03-21 16:47:47.427+07	\N	\N	\N	2023-03-21 16:47:47.427	master|40	2023-03-18 06:22:08.274	SELESAI	\N	SEDANG	1. Persyaratan izin belajar dapat dilihat pada informasi Layanan pada Website BKD Prov. Jatim\n2. Alur pengajuan izin belajar terlebih dahulu koordinasi dengan Perangkat Daerah masing-masing dan berkas usulan akan diproses oleh BKD Prov. Jatim melalui Aplikasi SIMASTER\n3. Surat izin belajar terbit dalam waktu 3-7 hari	\N	\N	f	14	f	f	f	f	f
147b93fd-ccc4-4206-bad8-5b41f62d4706	Pengajuan beasiswa s1	\N	<p>Pengajuan beasiswa s1 </p>	\N	V0PNN	master|56553	115330442806416686479	2023-03-21 17:34:12.050103+07	2023-03-21 17:34:12.050103+07	\N	\N	\N	\N	\N	\N	master|40	2023-03-24 14:27:00.031	DIAJUKAN	\N	\N	\N	\N	\N	f	\N	f	f	f	f	f
7a99e60b-fa0c-428a-bd2f-ad9d71328abe	Kronologi	\N	<p class="ql-align-justify">Mohon ijin, mohon maaf sebelumnya bila saya mengganggu waktu Bapak/Ibu Admin dengan mengirim pesan teks ini.</p><p class="ql-align-justify">Sebelumnya, dengan kerendahan hati, saya ingin menceritakan kronologi permasalahan yg kami hadapi terkait dengan kepegawaian.</p><p class="ql-align-justify">&nbsp;</p><p class="ql-align-justify">Perkenalkan, saya Muhammad Mirzaq Syahrial Alafi, PNS RSUD Dr. Soetomo, dengan pangkat Pengatur Muda Tingkat I - II/b. Dari pengangkatan CPNS 2014, dengan formasi jabatan Asisten Apoteker, dengan ijasah terakhir yg dilampirkan SMK Farmasi.</p><p class="ql-align-justify">&nbsp;</p><p class="ql-align-justify">- SK CPNS II/a, tanggal 28 Februari 2014, TMT 1 Maret 2014, Jabatan : Asisten Apoteker, Ijazah : Sekolah Menengah Farmasi (SMF) 2006</p><p class="ql-align-justify">- SPMT TMT : 7 Mei 2014, Gol II/a</p><p class="ql-align-justify">- SK PNS II/a, tanggal 29 Mei 2015, TMT 1 Juni 2015, Jabatan : Asisten Apoteker, Ijazah : SMF 2006</p><p class="ql-align-justify">- SK Penetepan PNS Dalam Jabatan Pelaksana dan Jabatan Fungsional Pemprov Jatim, tanggal 25 Februari 2016, diangkat dalam jabatan Asisten Apoteker Pemula II/a</p><p class="ql-align-justify">&nbsp;</p><p class="ql-align-justify">- Ijin Belajar S1 Komputer : 6 Oktober 2015</p><p class="ql-align-justify">- Ijazah S1 Teknik Informatika&nbsp;(S.Kom.) : 6 Juni 2018</p><p class="ql-align-justify">- Ijin Belajar D3 Farmasi : 11 September 2020</p><p class="ql-align-justify">- Ijazah D3 Farmasi (Amd.Farm.) : 27 September 2020</p><p class="ql-align-justify">&nbsp;</p><p class="ql-align-justify">- Tahun 2018 à mengajukan Kenaikan Pangkat (KP) Reguler, hasilnya ditolak BKD dengan keterangan BTL (Berkas Tidak Lengkap), kurang PAK</p><p class="ql-align-justify">- Tahun 2018 à akan membuat PAK, namun dapat masukan dari UP/SDM RSDS untuk sekolah D3 Farmasi dahulu</p><p class="ql-align-justify">- Tahun 2019 ikut program RPL D3 Farmasi, dan lulus di tahun 2020</p><p class="ql-align-justify">&nbsp;</p><p class="ql-align-justify">- Bulan Februari 2021 à Konsultasi dengan Bu Maria Ratnawati, Bu Endah, Bu Yeny Kusumaning Ayu (Dinkes Prov Jatim), terkait Permenkes No 23 Tahun 2019 Tentang Pengangkatan PNS dalam Jabfung Melalui Impassing. Jawaban : Akan dikonsultasikan dengan BKD, hasilnya akan diberitahukan melalui UP RSDS.</p><p class="ql-align-justify">Hasil à tidak ada kabar lebih lanjut</p><p class="ql-align-justify">&nbsp;</p><p class="ql-align-justify">- Bulan Februari 2021 à Menghadap ke Kepala Bidang Mutasi dan Jabatan BKD Prov Jatim (Bp. Yanto), terkait langkah yg harus saya tempuh.</p><p class="ql-align-justify">à Jawaban : akan dikoordinasikan dengan Kepegawaian (UP/SDM) RSDS</p><p class="ql-align-justify">&nbsp;</p><p class="ql-align-justify">- Bulan Februari 2021 à Menghadap Kasubbag Administrasi dan Pembinaan Pegawai RSDS, Kasubbag Formasi Kepegawaian RSDS.</p><p class="ql-align-justify">à Hasil : UP RSDS akan bersurat ke BKD Prov Jatim, lanjut ke KemenPAN dan BKN</p><p class="ql-align-justify">à Tujuan : meminta rekomendasi kenaikan pangkat reguler bagi PNS yg bersangkutan (saya)</p><p class="ql-align-justify">- Bulan November 2021, konsul dengan Tim Penilai Angka Kredit Dinkes Provinsi, terkait penyusunan DUPAK. Direkomendasikan untuk menyusun DUPAK periode April 2014 s/d April 2022, untuk diajukan pada April 2022</p><p class="ql-align-justify">à Akhirnya saya membuat DUPAK yg dimaksud, dan diajukan di bulan April 2022</p><p class="ql-align-justify">&nbsp;</p><p class="ql-align-justify">- Bulan Juni 2022, dari hasil Rapat Pleno Tim Penilai Angka Kredit Dinkes Provinsi, DUPAK milik saya tidak diloloskan (dengan alasan pangkat yg belum memenuhi aturan/syarat terbaru), syarat kepangkatan adalah min II/c dengan kualifikasi Ijazah min D-3. (Aturan ini saya kurang paham acuaanya dari mana)</p><p class="ql-align-justify">à Arahannya, dimungkinkan untuk bisa naik pangkat dulu secara reguler (sedangkan kami pernah mengajukan KP reguler sebelumnya di tahu 2018, namun ditolak)</p><p class="ql-align-justify">&nbsp;</p><p class="ql-align-justify">- Bulan Juli 2022, konsultasi dengan Pak Yudi P3DASI BKD, dan diarahkan untuk bisa naik pangkat secara reguler, melalui jabatan pelaksana. Hal tersebut juga telah di follow up oleh Pak Yudi, ke Mas Firman, Pak Hendro, Bu Agustin, Bagian Kepegawaian&nbsp;RSDS.</p><p class="ql-align-justify">&nbsp;</p><p class="ql-align-justify">- Mendapat SK Penetapan PNS Dalam Jabatan Pelaksana, Tanggal 26 Desember 2022, TMT 2 Januari 2023, diangkat dalam jabatan Pengadministrasi Gudang Farmasi.</p><p class="ql-align-justify">à Saat menerima SK pelaksana bulan Januari lalu di bagian SDM RSDS, kami diminta untuk membuat surat pernyataan yg menyatakan kesanngupan/kesediaan kembali ke Jabatan Fungsional begitu pangkat dan golongan telah memenuhi.</p><p class="ql-align-justify">- SK PNS II/b, tanggal 20 Februari 2023, TMT 1 April 2023, Jabatan : Pengadministrasi Gudang Farmasi, Ijazah : Sekolah Menengah Farmasi (SMF) 2006 à akhirnya setelah 9 belum pernah naik pangkat</p><p class="ql-align-justify">à Saya dinaikkan jabatan dari II/a ke II/b (9 tahun) melalui jalur reguler, dengan cara berpindah ke jabatan pelaksana. Saat itu, saya terkendala kenaikan pangkat secara fungsional, karena belum pernah membuat DUPAK.</p><p class="ql-align-justify">&nbsp;</p><p class="ql-align-justify">Mohon ijin menyampaikan pertanyaan :</p><p class="ql-align-justify">-&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Apakah saat ini ada kesempatan untuk mengikuti ujian PI, dari II/b mengajukan ijazah D3 Farmasi saya?</p><p class="ql-align-justify">-&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagaimana mekanisme saya untuk bisa masuk ke dalam jabatan fungsional Asisten Apoteker kembali? Apakah melalui langkah Ujian kompetensi?</p><p class="ql-align-justify">-&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Apakah ada kemungkinan saya bisa pindah ke bagian IT (Informasi &amp; Teknologi) dengan menggunakan ijazah S1 Komputer saya? Mengingat pada waktu konsultasi terkait perpindahan jabatan, saya berharap besar untuk bisa dimutasi ke bagian IT</p><p class="ql-align-justify">-&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagaimana mekanisme untuk bisa penyesuai ijazah dengan S1 saya?</p><p class="ql-align-justify">&nbsp;</p><p class="ql-align-justify">Ijin Bapak/Ibu, jadi untuk sat ini, kesempatan apapun yg ada d depan mata, akan saya ambil. Apakah itu kembali ke jabatan fungsional Asisten Apoteker, atau melimpah ke bagian IT</p><p class="ql-align-justify">&nbsp;</p><p class="ql-align-justify">Saya mengucapkan terima kasih banyak untuk jawaban yg Bapak/Ibu Admin berikan.&nbsp;</p><p><br></p><p><br></p><p>Berikut kami sertakan link konsultasi kam ini dalam format pdf yg lebih mudah dibaca --&gt;..</p><p>https://drive.google.com/file/d/1HBVVjRoGb6OfqjlqQoi65zBEaajlcUug/view?usp=share_link</p>	\N	4ZN7S	master|88	108534841868218569846	2023-03-20 23:33:13.477521+07	2023-03-26 21:33:29.368+07	\N	\N	\N	\N	\N	\N	master|40	2023-03-27 10:06:23.539	DIAJUKAN	\N	\N	\N	\N	\N	f	\N	f	f	f	f	f
9822009c-a4da-4787-bdcd-27c742c83307	Kronologi	\N	<p class="ql-align-justify">Mohon ijin, mohon maaf sebelumnya bila saya mengganggu waktu Bapak/Ibu Admin dengan mengirim pesan teks ini.</p><p class="ql-align-justify">Sebelumnya, dengan kerendahan hati, saya ingin menceritakan kronologi permasalahan yg kami hadapi terkait dengan kepegawaian.</p><p class="ql-align-justify">&nbsp;</p><p class="ql-align-justify">Perkenalkan, saya Muhammad Mirzaq Syahrial Alafi, PNS RSUD Dr. Soetomo, dengan pangkat Pengatur Muda Tingkat I - II/b. Dari pengangkatan CPNS 2014, dengan formasi jabatan Asisten Apoteker, dengan ijasah terakhir yg dilampirkan SMK Farmasi.</p><p class="ql-align-justify">&nbsp;</p><p class="ql-align-justify">- SK CPNS II/a, tanggal 28 Februari 2014, TMT 1 Maret 2014, Jabatan : Asisten Apoteker, Ijazah : Sekolah Menengah Farmasi (SMF) 2006</p><p class="ql-align-justify">- SPMT TMT : 7 Mei 2014, Gol II/a</p><p class="ql-align-justify">- SK PNS II/a, tanggal 29 Mei 2015, TMT 1 Juni 2015, Jabatan : Asisten Apoteker, Ijazah : SMF 2006</p><p class="ql-align-justify">- SK Penetepan PNS Dalam Jabatan Pelaksana dan Jabatan Fungsional Pemprov Jatim, tanggal 25 Februari 2016, diangkat dalam jabatan Asisten Apoteker Pemula II/a</p><p class="ql-align-justify">&nbsp;</p><p class="ql-align-justify">- Ijin Belajar S1 Komputer : 6 Oktober 2015</p><p class="ql-align-justify">- Ijazah S1 Teknik Informatika &nbsp;(S.Kom.) : 6 Juni 2018</p><p class="ql-align-justify">- Ijin Belajar D3 Farmasi : 11 September 2020</p><p class="ql-align-justify">- Ijazah D3 Farmasi (Amd.Farm.) : 27 September 2020</p><p class="ql-align-justify">&nbsp;</p><p class="ql-align-justify">- Tahun 2018 à mengajukan Kenaikan Pangkat (KP) Reguler, hasilnya ditolak BKD dengan keterangan BTL (Berkas Tidak Lengkap), kurang PAK</p><p class="ql-align-justify">- Tahun 2018 à akan membuat PAK, namun dapat masukan dari UP/SDM RSDS untuk sekolah D3 Farmasi dahulu</p><p class="ql-align-justify">- Tahun 2019 ikut program RPL D3 Farmasi, dan lulus di tahun 2020</p><p class="ql-align-justify">&nbsp;</p><p class="ql-align-justify">- Bulan Februari 2021 à Konsultasi dengan Bu Maria Ratnawati, Bu Endah, Bu Yeny Kusumaning Ayu (Dinkes Prov Jatim), terkait Permenkes No 23 Tahun 2019 Tentang Pengangkatan PNS dalam Jabfung Melalui Impassing. Jawaban : Akan dikonsultasikan dengan BKD, hasilnya akan diberitahukan melalui UP RSDS.</p><p class="ql-align-justify">Hasil à tidak ada kabar lebih lanjut</p><p class="ql-align-justify">&nbsp;</p><p class="ql-align-justify">- Bulan Februari 2021 à Menghadap ke Kepala Bidang Mutasi dan Jabatan BKD Prov Jatim (Bp. Yanto), terkait langkah yg harus saya tempuh. </p><p class="ql-align-justify">à Jawaban : akan dikoordinasikan dengan Kepegawaian (UP/SDM) RSDS</p><p class="ql-align-justify">&nbsp;</p><p class="ql-align-justify">- Bulan Februari 2021 à Menghadap Kasubbag Administrasi dan Pembinaan Pegawai RSDS, Kasubbag Formasi Kepegawaian RSDS. </p><p class="ql-align-justify">à Hasil : UP RSDS akan bersurat ke BKD Prov Jatim, lanjut ke KemenPAN dan BKN</p><p class="ql-align-justify">à Tujuan : meminta rekomendasi kenaikan pangkat reguler bagi PNS yg bersangkutan (saya)</p><p class="ql-align-justify">- Bulan November 2021, konsul dengan Tim Penilai Angka Kredit Dinkes Provinsi, terkait penyusunan DUPAK. Direkomendasikan untuk menyusun DUPAK periode April 2014 s/d April 2022, untuk diajukan pada April 2022</p><p class="ql-align-justify">à Akhirnya saya membuat DUPAK yg dimaksud, dan diajukan di bulan April 2022</p><p class="ql-align-justify">&nbsp;</p><p class="ql-align-justify">- Bulan Juni 2022, dari hasil Rapat Pleno Tim Penilai Angka Kredit Dinkes Provinsi, DUPAK milik saya tidak diloloskan (dengan alasan pangkat yg belum memenuhi aturan/syarat terbaru), syarat kepangkatan adalah min II/c dengan kualifikasi Ijazah min D-3. (Aturan ini saya kurang paham acuaanya dari mana)</p><p class="ql-align-justify">à Arahannya, dimungkinkan untuk bisa naik pangkat dulu secara reguler (sedangkan kami pernah mengajukan KP reguler sebelumnya di tahu 2018, namun ditolak)</p><p class="ql-align-justify">&nbsp;</p><p class="ql-align-justify">- Bulan Juli 2022, konsultasi dengan Pak Yudi P3DASI BKD, dan diarahkan untuk bisa naik pangkat secara reguler, melalui jabatan pelaksana. Hal tersebut juga telah di follow up oleh Pak Yudi, ke Mas Firman, Pak Hendro, Bu Agustin, Bagian Kepegawaian&nbsp;RSDS.</p><p class="ql-align-justify">&nbsp;</p><p class="ql-align-justify">- Mendapat SK Penetapan PNS Dalam Jabatan Pelaksana, Tanggal 26 Desember 2022, TMT 2 Januari 2023, diangkat dalam jabatan Pengadministrasi Gudang Farmasi.</p><p class="ql-align-justify">à Saat menerima SK pelaksana bulan Januari lalu di bagian SDM RSDS, kami diminta untuk membuat surat pernyataan yg menyatakan kesanngupan/kesediaan kembali ke Jabatan Fungsional begitu pangkat dan golongan telah memenuhi.</p><p class="ql-align-justify">- SK PNS II/b, tanggal 20 Februari 2023, TMT 1 April 2023, Jabatan : Pengadministrasi Gudang Farmasi, Ijazah : Sekolah Menengah Farmasi (SMF) 2006 à akhirnya setelah 9 belum pernah naik pangkat</p><p class="ql-align-justify">à Saya dinaikkan jabatan dari II/a ke II/b (9 tahun) melalui jalur reguler, dengan cara berpindah ke jabatan pelaksana. Saat itu, saya terkendala kenaikan pangkat secara fungsional, karena belum pernah membuat DUPAK.</p><p class="ql-align-justify">&nbsp;</p><p class="ql-align-justify">Mohon ijin menyampaikan pertanyaan :</p><p class="ql-align-justify">-&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Apakah saat ini ada kesempatan untuk mengikuti ujian PI, dari II/b mengajukan ijazah D3 Farmasi saya?</p><p class="ql-align-justify">-&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagaimana mekanisme saya untuk bisa masuk ke dalam jabatan fungsional Asisten Apoteker kembali? Apakah melalui langkah Ujian kompetensi?</p><p class="ql-align-justify">-&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Apakah ada kemungkinan saya bisa pindah ke bagian IT (Informasi &amp; Teknologi) dengan menggunakan ijazah S1 Komputer saya? Mengingat pada waktu konsultasi terkait perpindahan jabatan, saya berharap besar untuk bisa dimutasi ke bagian IT</p><p class="ql-align-justify">-&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagaimana mekanisme untuk bisa penyesuai ijazah dengan S1 saya?</p><p class="ql-align-justify">&nbsp;</p><p class="ql-align-justify">Ijin Bapak/Ibu, jadi untuk sat ini, kesempatan apapun yg ada d depan mata, akan saya ambil. Apakah itu kembali ke jabatan fungsional Asisten Apoteker, atau melimpah ke bagian IT</p><p class="ql-align-justify">&nbsp;</p><p class="ql-align-justify">Saya mengucapkan terima kasih banyak untuk jawaban yg Bapak/Ibu Admin berikan.&nbsp;</p><p class="ql-align-justify"><br></p><p class="ql-align-justify"><br></p><p class="ql-align-justify"><br></p><p>https://drive.google.com/file/d/1HBVVjRoGb6OfqjlqQoi65zBEaajlcUug/view?usp=sharing</p>	\N	0GVA0	master|56545	master|4057	2023-03-20 23:27:56.355719+07	2023-03-21 16:31:01.704+07	2023-03-21 10:14:43.651+07	2023-03-21 16:31:01.704+07	\N	\N	\N	2023-03-21 16:31:01.704	master|40	2023-03-21 09:35:59.765	SELESAI	\N	\N	Pencantuman gelar untuk mengusulkan KP PI	5	Baik terimakasih banyak Bapak/Ibu Admin untuk saran, masukan, dan arahannya. Sukses selalu	t	\N	f	f	f	f	f
ca39b655-b477-4898-a604-1531f8d38cef	Informasi mengenai WA center BKD bidang Mutasi	\N	<p>Assalamu'alaikum Warahmatullohi Wabarokatuh 🙏🙏🙏 </p><p>.</p><p>Saya Luluk Nurhamidah, ASN dari Kabupaten Tulungagung, unit kerja SMA NEGERI NGUNUT, </p><p>Sebelumnya Saya sudah melayangkan pertanyaan melalui tiket yang bernomor 04M25 mengenai progres tindak lanjut berkas PMK (peninjauan masa kerja), tiket saya sudah terjawab dan Saya diminta menghubungi WA center BKD bidang mutasi,</p><p>Mohon informasi mengenai WA center BKD bidang Mutasi tersebut, trimakasih 😊</p>	\N	OE4W5	master|56548	106221904072757493129	2023-03-21 16:44:15.301486+07	2023-03-24 15:28:18.036+07	2023-03-24 15:25:50.576+07	2023-03-24 15:28:18.036+07	\N	\N	\N	2023-03-24 15:28:18.036	master|40	2023-03-24 14:27:29.702	SELESAI	\N	\N	Silahkan menghubungi WA Center Bidang Mutasi	\N	\N	f	\N	f	f	f	f	f
af3d64bc-18f1-49f6-87c4-9330c1287591	Nasib	\N	<p>Mohon Ijin Apakah masih ada peluang nasib yang lebih baik bagi saya dan apakah masih bisa berkesempatan diangkat ASN atau P3K saya sudah bekerja di Instansi Pemerintahan sejak Tahun 2009 sampai sekarang secara terus menerus </p><p><br><img src="https://siasn.bkd.jatimprov.go.id:9000/public/b02f5d0b2a6ed6e618e1faca8f52fa2a397c7e35_image.png"></p>	\N	P0NSD	master|40	101182176522172754394	2023-03-26 14:03:52.7996+07	2023-03-26 22:46:20.457+07	2023-03-26 22:42:14.422+07	2023-03-26 22:46:20.457+07	\N	\N	\N	2023-03-26 22:46:20.457	master|40	2023-03-26 22:39:28.153	SELESAI	\N	\N	terimakasih sudah mencoba fitur baru helpdesk BKD Jatim - mohon masukan utk kami agar menjadi lebih baik.	\N	\N	f	\N	f	f	f	f	f
92b84a7a-776b-43db-b853-e2f1a946aece	Masa kerja sebelum cpns	\N	<p>Assalamualaikum.. </p><p>Selamat pagi.. ijin bertanya.. terkait masa kerja sebelum menjadi CPNS apakah itu bisa diajukan untuk dimasukkan di masa kerja yang sekarang? Mengingat dulu surat keterangan nya baru terbit setelah pengangkatan CPNS.</p><p>Jika bisa, alur pengurusan nya bagaimana?</p><p>Sebelumnya sy pernah bekerja di RSUD lain sekitar 3thn an. Jika diajukan untuk penyetaraan masa kerja, maka berapa tahun yang diakui ?</p><p><br></p><p>Terimakasih</p><p>Sehat selalu</p>	\N	TML5S	master|56548	master|61648	2023-03-15 03:42:00.832039+07	2023-03-27 09:41:44.946+07	2023-03-27 09:41:34.724+07	2023-03-27 09:41:44.946+07	\N	\N	\N	2023-03-27 09:41:44.946	master|40	2023-03-18 06:47:39.46	SELESAI	\N	\N	Terima kasih	\N	\N	f	\N	f	f	f	f	f
47f7f626-db64-4744-ba1e-13a260e93401	permohonan penerbitan surat keterangan tidak sedang menjalani tugas belajar	\N	<p>Assalamualaikum wr wb, selamat pagi, saya febrar helmi ghani, s.pd. sedang mengajukan permohonan penerbitan surat keterangan tidak sedang menjalani tugas belajar, melalui surat resmi dari dinas pendidikan prov.jatim dengan nomor surat 800/1573/101.1/2023 tanggal surat 8 maret 2023, diterima BKD prov jatim pada tanggal 10 maret 2023. sampai hari ini tanggal 21 maret 2023 saya belum menerima surat tersebut, saya sudah menghubungi dinas pendidikan prov jatim dan diinfokan masih menunggu dari BKD prov jatim, apakah surat permohonan saya sudah jadi? mohon informasinya. terima kasih.</p><p>berikut saya lampirkan surat permohonan tersebut dari dinas pendidikan prov jatim yang di tujukan ke BKD Prov.jatim. terima kasih</p><p>wassalamualaikum wr wb</p><p><br><img src="https://siasn.bkd.jatimprov.go.id:9000/public/83588ab9071c228fc8698807b813ef5612d76a21_WhatsApp Image 2023-03-20 at 09.47.29.jpeg"></p>	\N	TI3QJ	master|56553	108629014816953516277	2023-03-21 08:29:10.609643+07	2023-03-21 16:55:32.244+07	2023-03-21 16:37:29.368+07	2023-03-21 16:55:32.244+07	\N	\N	\N	2023-03-21 16:55:32.244	master|40	2023-03-21 09:34:31.576	SELESAI	\N	SEDANG	Surat sudah terbit dan sudah diserahkan ke Dinas Pendidikan Prov. Jatim	5	terima kasih atas informasinya, layanan ini sangat membatu saya memberikan solusi pengurusan berkas kepegawaian	t	14	f	f	f	f	f
8205714d-18b5-40bd-a1d2-baef0c6a6c17	Bagaimana cara memperbaharui data di mySAPK?	\N	<p>Assalamualaikum w.w. Selamat siang, perkenalkan saya Ibu Faiza dari Blitar.</p><p>Saya diminta oleh operator sekolah untuk memperbaharui nominal gaji pokok di aplikasi MY SAPK BKN agar nominal gaji di INFO GTK sesuai dengan data saat ini saya sebagai PPPK. Saya mau menanyakan bagaimana saya bisa memperbaharui data di aplikasi MySAPK BKN? Saya sudah login dan masuk ke akun MySAPK saya tp saya tidak bisa menambahkan data. Mohon pencerahannya. Terima kasih.</p>	\N	YS75V	master|56543	110303135123066864005	2023-03-16 13:02:41.027204+07	2023-03-22 22:18:38.002+07	2023-03-16 13:08:05.77+07	2023-03-22 22:18:38.002+07	\N	\N	\N	2023-03-22 22:18:38.002	master|56543	2023-03-16 13:07:53.975	SELESAI	\N	\N	harus lewat siasn dengan mengusulkan usulan baru	\N	\N	f	\N	f	f	f	f	f
6dd268f6-4240-4d90-9145-83ed03ec9443	Endah Meiranda Purbaningrum	\N	<h1>Aturan tata cara dan administrasi pindah dinas dari Jawa Tengah ke Jawa Timur tahun 2023</h1>	\N	IXFIM	master|56548	103607405887123196492	2023-03-24 07:20:07.566992+07	2023-03-24 15:48:44.771+07	2023-03-24 15:45:15.651+07	2023-03-24 15:48:44.771+07	\N	\N	\N	2023-03-24 15:48:44.771	master|40	2023-03-24 14:18:08.744	SELESAI	\N	\N	Silahkan untuk berkoordinasi dahulu dengan Pengelola Kepegawaian Instansi masing-masing	\N	\N	f	\N	f	f	f	f	f
83804d69-6aee-4e08-90fd-3690f7176671	Jabatan Fungsional Golongan III d	\N	<p>Assalamualaikum wr. wb.</p><p>Mohon informasi bagaimanakah alur pengajuan jabatan fungsional dari IIIc ke IIId, apa saja yang dipersiapkan dan apakah ada uji kompensinya. Terima kasih.</p><p>Wassalamualaikum wr wb.</p>	\N	NVKVM	master|56548	master|33634	2023-03-23 07:33:35.505017+07	2023-03-27 10:12:54.234+07	2023-03-27 10:12:43.31+07	2023-03-27 10:12:54.234+07	\N	\N	\N	2023-03-27 10:12:54.234	master|40	2023-03-24 14:18:28.445	SELESAI	\N	\N	Terima kasih	\N	\N	f	\N	f	f	f	f	f
ff43bf2a-3b57-4422-aeb3-d20479a9e675	Syarat Mutasi Masuk Pemprov Jatim	\N	<p>Berdasarkan layanan mutasi di link berikut:</p><p>https://bkd.jatimprov.go.id/mutasi</p><p>Mohon diberikan format</p><p>1.surat permohonan pindah</p><p>2. Surat pernyataan bermaterai kesanggupan apabila diterima menjadi PNS di pemerintahan Provinsi Jawa Timur</p><p>3.Surat pernyataan bermaterai pakta integritas sebagai PNS di provinsi jawa Timur</p><p>4. Surat pernyataan bebas dari pinjaman dan hutang piutang</p><p>5. Surat persetujuan pindah/mengetahui dari Istri</p><p>Dari: Ahmad Mishbahuddin</p><p>PNS fungsional guru di pemerintahan Kabupaten Banggai kepulauan Sulawesi Tengah</p>	\N	BAKA9	master|56545	111539702573555436705	2023-03-21 20:19:25.298525+07	2023-03-27 14:09:35.602+07	2023-03-27 14:08:44.383+07	2023-03-27 14:09:35.602+07	\N	\N	\N	2023-03-27 14:09:35.602	master|40	2023-03-24 14:19:07.288	SELESAI	\N	\N	Tidak ada format khusus permohonan mutasi, asalkan isi jelas dan sesuai tujuan	\N	\N	f	\N	f	f	f	f	f
930318bf-0629-4c13-9afe-dd25b1359463	Minta Info Perpindahan (Mutasi) Antar Instansi 	\N	<h1><strong><span class="ql-cursor">﻿</span></strong></h1>	\N	VO8Q9	master|56548	103059080006583136498	2023-03-22 07:26:51.901942+07	2023-03-24 15:31:40.26+07	2023-03-24 15:29:32.057+07	2023-03-24 15:31:40.26+07	\N	\N	\N	2023-03-24 15:31:40.26	master|40	2023-03-24 14:18:50.868	SELESAI	\N	\N	Silahkan berkoordinasi dengan pengelola kepegawaian instansi	\N	\N	f	\N	f	f	f	f	f
608ed4c0-39f3-4e32-9705-8c319dec2652	Pengajuan Peninjauan Masa Kerja	\N	<p>Mohon ijin menanyakan persyaratan pengajuan Peninjauan Masa Kerja bagi PNS dan kira-kira berapa lama prosesnya?</p><p>Terimakasih sebelumnya</p>	\N	0EMHF	master|56548	115382242955323579661	2023-03-24 08:01:00.313828+07	2023-03-24 15:37:58.018+07	2023-03-24 15:34:46.495+07	2023-03-24 15:37:58.018+07	\N	\N	\N	2023-03-24 15:37:58.018	master|40	2023-03-24 14:16:30.873	SELESAI	\N	\N	Silahkan untuk segera ditindaklanjuti dan berkoordinasi dengan Pengelola Kepegawaian Instansi terlebih dahulu	\N	\N	f	\N	f	f	f	f	f
a810fcbb-c7b2-4887-bb4f-221eafdd15e4	Informasi Mutasi Antar Instansi dari Luar Pemprov Jatim ke Pemprov Jatim  	\N	<ol><li><strong><span class="ql-cursor">﻿</span></strong></li></ol>	\N	0X77N	master|56548	103059080006583136498	2023-03-27 07:55:20.540043+07	2023-03-27 09:30:50.701+07	2023-03-27 09:30:29.298+07	2023-03-27 09:30:50.701+07	\N	\N	\N	2023-03-27 09:30:50.701	master|40	2023-03-27 09:28:55.437	SELESAI	\N	\N	Terima kasih	\N	\N	f	\N	f	f	f	f	f
cbc1c8db-b8f3-4408-b0e9-acb16477ef12	Gaji Tenaga Honorer Naik di Tahun 2023? Ini Rincian Lengkap Berdasarkan SBM Anggaran Tahun Ini  	\N	<p>Mohon Ijin sebelumnya maaf.., sedangkan gaji saya di pemerintah Kabupaten Madiun Dinas Pertanian dan Perikanan Kab Madiun saya bekerja mulai 2009 tanpa henti dari sampai sekarang mulai dari gaji 300.000,- sampai saat ini 1,400.000,-</p>	\N	S0UHJ	master|88	101182176522172754394	2023-03-26 13:53:50.901135+07	2023-03-26 13:53:50.901135+07	\N	\N	\N	\N	\N	\N	master|40	2023-03-26 22:39:55.815	DIAJUKAN	\N	\N	\N	\N	\N	f	\N	f	f	f	f	f
65722874-83ac-435b-b0e1-11334c9ba60f	cara mengaktifkan askes pensiunan tni 	\N	<p>Assalammualaikum</p><p>mohon ijin bertanya ,saya salah satu cucu dari Bu Sainem. Usia nenek saya sudah 90 lebih . Ketika akan berobat askes nenek saya tidak aktif dan dari BPJS  disuruh untuk mengurus ke kantor taspen . yang mau sya tanyakan apasaja persyaratan dan prosedur untuk mengaktifkan askes tersebut?</p><p><br></p>	\N	C8LJO	master|56548	100924312039026485175	2023-03-26 10:14:00.820323+07	2023-03-27 09:35:32.862+07	2023-03-27 09:35:13.499+07	2023-03-27 09:35:32.862+07	\N	\N	\N	2023-03-27 09:35:32.862	master|40	2023-03-26 22:40:13.004	SELESAI	\N	\N	Terima kasih 	\N	\N	f	\N	f	f	f	f	f
45963a60-ebf3-4b75-9a78-6aa164467970	Mutasi dari pemerintah kabupaten pandeglang provinsi banten, ke pemerintah provinsi jawa timur	\N	<p>Mohon arahan secara detail bagaimana caranya dan di bagian mana saya menyerahkan berkas berkas syarat mutasi (dari pemerintah kabupaten pandeglang banten, ke pemerintah provinsi jawa timur) ??</p><p><br></p>	\N	OX7GM	master|56548	112263634041057016989	2023-03-25 12:55:30.653505+07	2023-03-27 09:28:32.666+07	2023-03-27 09:15:50.276+07	2023-03-27 09:28:32.666+07	\N	\N	\N	2023-03-27 09:28:32.666	master|40	2023-03-26 22:40:28.076	SELESAI	\N	\N	Silahkan untuk segera ditindaklanjuti , terima kasih \n	\N	\N	f	\N	f	f	f	f	f
3a919bd4-862e-4258-9986-68fcd9ab806f	TPP PPPK 	\N	<p>Mau tanya pak.</p><p>Mengapa take home pay TPP PPPK dan PNS tidak sama.</p><p>Mengapa demikian. Minta penjelasan nya</p>	\N	7VQSY	master|88	118307335638196293112	2023-03-25 06:46:06.340398+07	2023-03-25 06:46:37.725+07	\N	\N	\N	\N	\N	\N	master|40	2023-03-26 22:40:47.188	DIAJUKAN	\N	\N	\N	\N	\N	f	\N	f	f	f	f	f
71ca28f9-b840-4c66-a5a7-73afeb16b3f9	SYARAT PENGAJUAN KENAIKAN PANGKAT JABATAN FUNGSIONAL	\N	<p>APA SAJA SYARAT-SYARAT PENGAJUAN KP GOLONGAN BAGI JABATAN FUNGSIONAL?</p>	\N	8MRRF	\N	106583115163591403609	2023-03-27 13:11:41.268513+07	2023-03-27 13:11:41.268513+07	\N	\N	\N	\N	\N	\N	\N	\N	DIAJUKAN	\N	\N	\N	\N	\N	f	\N	f	f	f	f	f
d5870193-18f0-463b-9dd3-ca46a77195e9	Syarat Mutasi Masuk Pemprov Jatim	\N	<p>Berdasarkan layanan mutasi di link berikut:</p><p>https://bkd.jatimprov.go.id/mutasi</p><p>Mohon diberikan format</p><p>1.surat permohonan pindah</p><p>2. Surat pernyataan bermaterai kesanggupan apabila diterima menjadi PNS di pemerintahan Provinsi Jawa Timur</p><p>3.Surat pernyataan bermaterai pakta integritas sebagai PNS di provinsi jawa Timur</p><p>4. Surat pernyataan bebas dari pinjaman dan hutang piutang</p><p>5. Surat persetujuan pindah/mengetahui dari Istri</p><p>Dari: Ahmad Mishbahuddin</p><p>PNS fungsional guru di pemerintahan Kabupaten Banggai kepulauan Sulawesi Tengah</p>	\N	9PDTM	master|56545	111539702573555436705	2023-03-21 20:19:22.833919+07	2023-03-27 14:09:59.567+07	2023-03-27 14:09:53.034+07	2023-03-27 14:09:59.567+07	\N	\N	\N	2023-03-27 14:09:59.567	master|40	2023-03-24 14:19:20.933	SELESAI	\N	\N	Tidak ada format khusus permohonan mutasi, asalkan isi jelas dan sesuai tujuan	\N	\N	f	\N	f	f	f	f	f
\.


--
-- Data for Name: tickets_agents_helper; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tickets_agents_helper (user_custom_id, ticket_id, created_at, updated_at, role_id) FROM stdin;
\.


--
-- Data for Name: tickets_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tickets_attachments (id, ticket_id, file_name, file_path, file_type, file_size, file_url, created_at) FROM stdin;
\.


--
-- Data for Name: tickets_comments_agents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tickets_comments_agents (id, ticket_id, user_id, comment, html, created_at, role) FROM stdin;
\.


--
-- Data for Name: tickets_comments_customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tickets_comments_customers (id, ticket_id, comment, created_at, updated_at, role, user_id, is_answer, is_edited) FROM stdin;
25	59749fe7-d7bd-4135-b6a0-b4a501e384ae	<p>maaf apa sudah coba reset mandiri</p>	2022-11-12 07:08:23.753087+07	2022-11-12 07:08:23.753087+07	assignee	master|40	f	f
26	59749fe7-d7bd-4135-b6a0-b4a501e384ae	<p>sudah tapi masih menhalami kendala di pc daya</p>	2022-11-12 07:09:23.580724+07	2022-11-12 07:09:23.580724+07	requester	113359564305461720000	f	f
27	59749fe7-d7bd-4135-b6a0-b4a501e384ae	<p>baik saya bantu resetkan ya</p><p><br></p>	2022-11-12 07:10:10.072669+07	2022-11-12 07:10:10.072669+07	assignee	master|40	f	f
28	8f69ea77-b08e-4269-be92-3ce0e602f958	<p>tes</p>	2022-11-12 13:52:13.101639+07	2022-11-12 13:52:13.101639+07	assignee	master|40	f	f
29	db65a963-23f5-4b60-bb80-c3f15040e92f	<p>hahah halo mbak fisnia</p>	2022-11-12 14:05:20.293359+07	2022-11-12 14:05:20.293359+07	assignee	master|56543	f	f
30	db65a963-23f5-4b60-bb80-c3f15040e92f	<p>ini ada rencana untuk menambahkan face recognitiion sama bidang pkph. Pasti dipersempit lagi kok untuk cheating absen..</p>	2022-11-12 14:06:14.06104+07	2022-11-12 14:06:14.06104+07	assignee	master|56543	f	f
31	4d64f511-5fc9-47ad-b3ed-69b6d76dbf5a	<p>tes</p>	2022-11-12 15:16:40.1423+07	2022-11-12 15:16:40.1423+07	assignee	master|40	f	f
32	4d64f511-5fc9-47ad-b3ed-69b6d76dbf5a	<p>Terimaaksih sudah mencoba fitur baru dari BKD Jatim,</p><p>baik utk pertanyaa mbak terkait P3 apakah tidak mendapatkan tempat, maka ilustrasi gambar berikut mgkn bisa memberikan pencerahan sbb :</p><p><br></p>	2022-11-12 15:17:03.183581+07	2022-11-12 15:17:03.183581+07	assignee	master|40	f	f
33	4d64f511-5fc9-47ad-b3ed-69b6d76dbf5a	<p><br><img src="https://siasn.bkd.jatimprov.go.id:9000/public/3d1a80fd4c722bfbbdbd99ab63c938a6389299aa_image.png"></p>	2022-11-12 15:17:17.051272+07	2022-11-12 15:17:17.051272+07	assignee	master|40	f	f
34	4d64f511-5fc9-47ad-b3ed-69b6d76dbf5a	<p>Saya guru mapel induk satu-satunya yg mendaftar di formasi tersebut pak. Apakah ada kemungkinan tdk ada formasi tersebut krn sudah terisi oleh P1? </p>	2022-11-12 15:51:37.16013+07	2022-11-12 15:51:37.16013+07	requester	115201648402085603083	f	f
35	4d64f511-5fc9-47ad-b3ed-69b6d76dbf5a	<p>Apakah jam mengajar di dapodik harus 18 jam pak? Krn jam mengajar saya masih nol di dapodik, belum disinkron oleh operator</p>	2022-11-12 15:56:34.626079+07	2022-11-12 15:56:34.626079+07	requester	115201648402085603083	f	f
36	db65a963-23f5-4b60-bb80-c3f15040e92f	<p>ku close ya mbak nanti jangan lupa kasih bintang 5 ya? wkwkkwkw</p><p>ini masih percobaan buat gininian</p>	2022-11-12 17:45:38.339331+07	2022-11-12 17:45:38.339331+07	assignee	master|56543	f	f
37	4d64f511-5fc9-47ad-b3ed-69b6d76dbf5a	<p>apa sudah di cek di pengumuman bkd jatim di tautan https://bkd.jatimprov.go.id/Rekrutmen-PPPK2022</p>	2022-11-12 18:18:35.221418+07	2022-11-12 18:18:35.221418+07	assignee	master|40	f	f
38	f24bc9df-6f65-4875-8090-c3204b76eed8	<p>halo selamat malam, untuk problemnya apa bisa dijelaskan secara rinci? atau bisa menggunakan gambar.</p><p>untuk memilih unit verifikasi memang harus dari personalnya masing2 melalui aplikasi <a href="https://mysapk.bkn.go.id/" rel="noopener noreferrer" target="_blank">https://mysapk.bkn.go.id/</a> kemudian pilih unit verifikator</p><p><br></p><p>terima kasih</p>	2022-11-12 18:59:17.388652+07	2022-11-12 18:59:17.388652+07	assignee	master|56543	f	f
39	fcc728ce-edca-4267-9c9e-10f8e99873e8	<p>halo, boleh tau nip nya berapa?</p><p>bisa kami bantu  cekkan</p>	2022-11-12 19:43:49.093543+07	2022-11-12 19:43:49.093543+07	assignee	master|56543	f	f
40	de739ca3-b41a-4ed3-9d56-38b8b7333b71	<p>halo arimita savithri, saya iput dari bidang p3dasi. Untuk riwayat keluarga sudah masuk di siasn verifikator. berikut kami screenshotkan</p><p><br><img src="https://siasn.bkd.jatimprov.go.id:9000/public/abd9bb6e338d0de5fd8911b42557af5209271b22_image.png"></p><p><br></p><p>untuk riwayat keluarga supaya hijau, pastikan urut mulai dari </p><ol><li>riwayat orang tua kemudian klik data sudah sesuai.</li><li>riwyat pasangan kemudian klik data sudah sesuai.</li><li>dan yang terakhir anak, klik data sudah sesuai</li></ol><p>tiketnya saya sudahi dulu ya..</p><p>nanti kalau bertanya open tiket lagi</p><p><br></p><p>terima kasih. semoga membantu. Jangan lupa rate nya ya...</p>	2022-11-13 19:38:59.064318+07	2022-11-13 19:38:59.064318+07	assignee	master|56543	f	f
41	fcc728ce-edca-4267-9c9e-10f8e99873e8	<p>pastikan data ternentri dan sesuai pada riwayat keluarga. Kalau ingin menjadi hijau, silahkan klik bergantian data sudah sesuai pada masing-masing riwyat keluarga.</p><p>Untuk masalah masih bisa diperbaiki atau tidak...</p><p><br></p><p>Bisa mengajukan perubahan diverifikator, akan tetapi verifikator hanya mengedit bukan menambah.</p><p>terima kasih. jangan lupa kasih rate ya...</p><p><br></p><p>kami close dulu, kalau nanti masih ada pertanyaan silahkan open tiket lagi</p>	2022-11-13 19:43:56.230804+07	2022-11-13 19:43:56.230804+07	assignee	master|56543	f	f
42	f24bc9df-6f65-4875-8090-c3204b76eed8	<p>kami close tiket dulu ya...</p><p>kalau ada lagi yang ditanyakan silahkan open tiket lagi.. terima kasih</p><p><br></p><p>jangan lupa kasih rate ya..</p>	2022-11-13 19:45:53.813412+07	2022-11-13 19:45:53.813412+07	assignee	master|56543	f	f
43	71faf21c-ab26-46ef-a7d6-5edd7422feca	<p>halo, Miftakhul Khasan... perkenalkan saya iput dari bidang p3dasi. Untuk menjadikan hijau pada riwayat keluarga pastikan klik data sudah sesuai secara berurutan.</p><p>namun sebelum itu, pastikan kembali data keluarga sudah diinput dengan benar ya..</p><p><br></p><p>sekali lagi pastikan diklik data secara berurutan mulai dari</p><p><br></p><ol><li>data ortu, klik data sudah sesuai</li><li>data pasangan, klik data sudah sesuai</li><li>data anak, klik data sudah sesuai</li></ol><p>terima kasih..</p><p><br></p><p>jangan lupa kasih rate ya...</p><p><br></p><p>saya close tiket dulu nanti kalau ada pertanyaan bisa open tiket lagi</p>	2022-11-13 19:53:41.336682+07	2022-11-13 19:53:41.336682+07	assignee	master|56543	f	f
44	54875844-5519-47b3-a36e-edc35824d152	<p>terimakasih sudah mencoba fitur baru layanan kepegawaian BKD Jatim,</p><p>Utk dapat terdata pada SI-SDMK harap menghubungi dinkes masing.</p><p>Maaf dari instansi mana ?</p>	2022-11-13 23:03:32.944871+07	2022-11-13 23:03:32.944871+07	assignee	master|40	f	f
45	087e0e16-6b12-497c-bbcc-ef252f0fcb79	<p>Terimakasih sudah mencoba fitur baru layanan BKD jatim,</p><p>baik utk pengajuan e materai mohon di TTD dahulu lalu di scan PDF dan dibubuhi e-materi dan mengena TTD</p><p>Demikian terimakasih</p>	2022-11-13 23:05:32.811638+07	2022-11-13 23:05:32.811638+07	assignee	master|40	f	f
46	09169b6c-d830-4fba-8e08-87993524b53b	<p>Terimakasih sudah mencoba fitur baru layanan kepegawaian BKD Jatim,</p><p><br></p><p>Utk riwayat organiasasi kami sarankan tetap ada bukti dokumen unggah. Jika ragu silahkan langsung klik DATA SUDAH SESUAI</p><p>Demikian terimakasih.</p>	2022-11-13 23:11:28.460911+07	2022-11-13 23:11:28.460911+07	assignee	master|40	f	f
47	4d64f511-5fc9-47ad-b3ed-69b6d76dbf5a	<p><br><img src="https://siasn.bkd.jatimprov.go.id:9000/public/b59bcd54429c65ffe815ae5b6c205787595e0054_image.png"></p>	2022-11-13 23:13:13.66011+07	2022-11-13 23:13:13.66011+07	assignee	master|40	f	f
48	8c4e4117-056d-4a39-8602-5aabe70dd54b	<p>Terimakaih sudah mencoba fitur baru layanan kepegawaian BKD jatim,</p><p><br></p><p>Maaf program p3k ? apakah yg dimaksud rekurtmen p3k 2022  kah ?</p>	2022-11-13 23:14:21.180668+07	2022-11-13 23:14:21.180668+07	assignee	master|40	f	f
49	8acc14d2-965f-4a9a-b3ab-d85791fb92c8	<p>Terimakasih sudah mencoba fitur baru layanan kepegawaian BKD Jatim,</p><p><br></p><p>Ibu Yemima, apakah sudah mencoba hub cabdin madiun atau operator sekolah utk merubah daat dapodik ?</p><p>Jika ada kesulitan ke cabdin nanti kami info cp cabdin madiun.</p><p>Demikian semoga bisa terjawab. Terimakasih</p>	2022-11-13 23:16:51.656354+07	2022-11-13 23:16:51.656354+07	assignee	master|40	f	f
50	8514d159-c407-4a06-a630-ec8341a0073e	<p>Terimakasih sudah mencoba fitur baru BKD Jatim,</p><p>Utk problem SISDMK jika terkendala coba hub dinkes setempat, atau bisa masuk di helpdesk SSCASN</p><p><br></p><p>Demikian smga terjawab.</p><p>Terimakasih</p>	2022-11-13 23:22:54.681715+07	2022-11-13 23:22:54.681715+07	assignee	master|40	f	f
51	0efbc0dc-4032-4a1a-bfc1-47f5be78b541	<p>Terimakasih sudah mencoba fitur baru layanan kepegawaian BKD Jatim,</p><p><br></p><p>Maaf utk pengajuan NUPTK memang sebaiknya kami arahkan sepenuhknya ke dinas pendidikan. Maka coba di kordinasikan ke operator sekolah dan cabdin.</p><p>Mungkin bisa menyimak di https://www.youtube.com/watch?v=7_2HT2sHjiY</p><p><br></p><p>Demikian semoga terwajab. Terimakasih</p>	2022-11-14 04:28:13.160344+07	2022-11-14 04:28:13.160344+07	assignee	master|40	f	f
52	0efbc0dc-4032-4a1a-bfc1-47f5be78b541	<p>Terima kasih banyak bapak atas informasi yang telah diberikan. </p>	2022-11-14 14:12:11.379097+07	2022-11-14 14:12:11.379097+07	requester	master|69837	f	f
53	d8b8dd9f-13ce-4993-9548-bcd5590d722e	<p>Terimakasih sudah mencoba fitur baru layanan kepegawaian BKD jatim,</p><p><br></p><p>kemudian utk pengajuan surat keterangan rekom tugas belajar a,n Achmad Shocheb PNS di UPT SMAN 1 Singosari kami persilahkan utk melayangkan surat permohonan ke BKD jatim c/q bid pengembangan di jam kerja. Utk CP bisa hub bu decy daria.</p><p><br></p><p>Demikian terimakasih,&nbsp;</p>	2022-11-15 08:48:43.210489+07	2022-11-15 08:48:43.210489+07	assignee	master|40	f	f
55	6e45b099-9a8d-489e-941d-efed7ead63db	<p>Halo, saya iput dari bidang P3DASI.  apa bisa discreenshotkan lewat chat? </p><p>untuk unit verifikator jika anda dari sekolah silahkan pilih cabang dinas pendidikan yang sesuai terima kasih.</p>	2022-11-15 18:05:12.594258+07	2022-11-15 18:05:12.594258+07	assignee	master|56543	f	f
56	6a96c555-62a9-411e-9150-4769e680b1e2	<p>Halo, saya iput dari bidang P3DASI BKD Provinsi Jawa Timur. apa bisa discreenshotkan data dukungnya kalau belum bisa masuk?</p><p>atau bisa diberikan email dan nip nya?</p><p>supaya bisa kami cek.</p><p><br></p><p>kalaupun ada pergantian email silahkan tuliskan email yang baru. terima kasih</p>	2022-11-15 18:08:08.671225+07	2022-11-15 18:08:08.671225+07	assignee	master|56543	f	f
57	61b169b4-3d4b-43b5-84dd-1668ed222e8a	<ol><li> kalau single, bisa di klik data sudah sesuai mulai dari orang tua, kemudian pasangan, dan terakhir anak. Perlu diingat lagi harus berurutan. Pasti nanti hijau.</li><li> bisa diedit melalui verifikator masing-masing perangkat daerah.</li></ol>	2022-11-15 18:11:58.931803+07	2022-11-15 18:11:58.931803+07	assignee	master|56543	f	f
58	61b169b4-3d4b-43b5-84dd-1668ed222e8a	<p>kami close tiketnya, nanti bisa open tiket lagi kalau ada masalah. Jangan lupa kasih data pendukung ya bisa screenshot dan link</p>	2022-11-15 18:14:09.198683+07	2022-11-15 18:14:09.198683+07	assignee	master|56543	f	f
59	3087e298-da93-4d1a-bcbf-355b0887cc74	<p>Terimakasih sudah mencoba fitur baru layanan BKD Jatim,</p><p><br></p><p>Untuk pengisian kolom KARIS/KARSU dan TASPEN jika belum punya cukup di isi angka 0 saja.</p><p>Demikian Terimakasih</p>	2022-11-16 05:33:17.256802+07	2022-11-16 05:33:17.256802+07	assignee	master|40	f	f
60	6e45b099-9a8d-489e-941d-efed7ead63db	<p>saya close tiket dulu. nanti kalau ada pertanyaan silahkan open tiket lagi</p>	2022-11-17 13:55:50.186174+07	2022-11-17 13:55:50.186174+07	assignee	master|56543	f	f
61	6a96c555-62a9-411e-9150-4769e680b1e2	<p>saya close tiket.</p>	2022-11-17 13:57:02.559373+07	2022-11-17 13:57:02.559373+07	assignee	master|56543	f	f
62	b5217503-273b-4b6e-8026-2c712f3d994a	<p>ndak apa apa unit verifikasinya ikut yang lama terlebih dahulu </p><p><br></p><p>kami cekkan sebentar</p>	2022-11-17 13:59:55.1402+07	2022-11-17 13:59:55.1402+07	assignee	master|56543	f	f
63	b5217503-273b-4b6e-8026-2c712f3d994a	<p><br><img src="https://siasn.bkd.jatimprov.go.id:9000/public/e0f1a83eda7628e67519e155f9953bef32c377a7_image.png"></p><p><br></p><p>kami informasikan sebagai berikut</p><p>unit verifikasi nya cabdin madiun</p><p>untuk jabatan terakhir di 4 kota madiun dan status usulannya masih belum diverifikasi. artinya apabila merubah data bisa lewat verifikator cabdin madiun</p><p>terim kasih</p>	2022-11-17 14:06:21.955142+07	2022-11-17 14:06:21.955142+07	assignee	master|56543	f	f
64	6a7cfdc5-7dd9-4f2b-b1c4-3fb47b586614	<p>Selamat siang, saya Qaharrudin Widyarto dari SMKN 5 Malang. saya ingin menanyakan terkait prosedur penempatan PPPK tahun 2022,</p><ol><li>Bagaimana cara menentukan lokasi formasi yang akan dijadikan sebagai lokasi penempatan?</li><li>Bagaimana jika lokasi penempatan tidak sesuai dengan harapan dari pendaftar PPPK?</li><li>Apakah PPPK bisa mengajukan mutasi ketika ada proses perpanjangan kontrak pada April 2023 nanti?</li></ol><p>Jawab :</p><ol><li>Maaf yg dimaksud Formasi p3k Guru ya ? Tentunya yg sudah di informasikan di medsos dan web resmi kemdikbud penempatan berdasrkan prioritas 1, 2 dan 3 serta umum</li><li> Tentunya itu adalah pilihan dari system yang ditetapkan,</li><li> Mutasi perindahan tergantung alasan yg di sampaikan bahwa semua kebutuhan guru P3k di pemprov jatim sudah ter entry pada aplikasi AG-TK DINDIK jatim</li></ol><p>Demikian terimakasih</p>	2022-11-20 00:40:19.664572+07	2022-11-20 00:40:19.664572+07	assignee	master|40	f	f
65	6a7cfdc5-7dd9-4f2b-b1c4-3fb47b586614	<p>Terima kasih atas jawabannya pak.</p>	2022-11-20 21:03:50.849494+07	2022-11-20 21:03:50.849494+07	requester	master|67134	f	f
66	f979042d-a5c0-4b5c-9909-830841e37325	<p>untuk pertanyaan seputar kepegawaian bisa di helpdesk bkd di alamat ini</p><p>atau bisa melalui web bkd jatim</p><p>di alamat <a href="https://bkd.jatimprov.go.id/wbsbkdjatim/pengaduan" rel="noopener noreferrer" target="_blank">https://bkd.jatimprov.go.id/wbsbkdjatim/pengaduan</a></p><p>terim kasih</p>	2022-11-21 19:17:18.308909+07	2022-11-21 19:17:18.308909+07	assignee	master|56543	f	f
67	6a7cfdc5-7dd9-4f2b-b1c4-3fb47b586614	<p>maaf pak danar saya mau bertanya lagi..untuk PPPK guru itu untuk mengajukan mutasi prosedur atau aturannya bagaimana pak?. pertanyaan saya terakhir untuk menyelesaikan pengajuan ticket ini bagaimana pak?</p>	2022-11-22 22:39:35.03022+07	2022-11-22 22:39:35.03022+07	requester	master|67134	f	f
68	413d31a6-88e6-4743-ab4c-c7d9ce5d3b12	<p>Halo, perkenalkan nama saya Iput dari bidang P3DASI yang bertugas sebagai Admin SIASN.</p><p>Untuk permasalahan diatas sebetulnya bisa dirubah jabatannya dengan cara mengklik input usul kemudian isi semua form yang dibutuhkan.</p><p>jangan lupa persiapkan SK nya ya.</p><p><br></p><p>Silahkan apa amsih ada perntanyaan yang lain?</p>	2023-01-28 18:36:07.213226+07	2023-01-28 18:36:07.213226+07	assignee	master|56543	f	f
69	413d31a6-88e6-4743-ab4c-c7d9ce5d3b12	<p>Terima kasih sudah dijawab. Apakah langsung berubah ya datanya ?</p>	2023-01-28 18:37:47.099433+07	2023-01-28 18:37:47.099433+07	requester	105503740477298041174	f	f
70	413d31a6-88e6-4743-ab4c-c7d9ce5d3b12	<p>iyaps langsung berubah</p>	2023-01-28 18:38:11.135387+07	2023-01-28 18:38:11.135387+07	assignee	master|56543	f	f
71	413d31a6-88e6-4743-ab4c-c7d9ce5d3b12	<p>baik kalau begitu terima kasih atas bantuannya</p>	2023-01-28 18:38:24.017564+07	2023-01-28 18:38:24.017564+07	requester	105503740477298041174	f	f
72	413d31a6-88e6-4743-ab4c-c7d9ce5d3b12	<p>Sama-sama. Baik kalau begitu saya tutup ya permasalahannya</p>	2023-01-28 18:38:50.214921+07	2023-01-28 18:38:50.214921+07	assignee	master|56543	f	f
73	413d31a6-88e6-4743-ab4c-c7d9ce5d3b12	<p>Jangan Lupa bintang 5 nya ya?</p>	2023-01-28 18:39:01.908664+07	2023-01-28 18:39:01.908664+07	assignee	master|56543	f	f
74	413d31a6-88e6-4743-ab4c-c7d9ce5d3b12	<p>baik gan</p>	2023-01-28 18:39:14.138061+07	2023-01-28 18:39:14.138061+07	requester	105503740477298041174	f	f
75	73dbd6d9-c8b7-4657-bfa0-32a581f73a8b	<p>apa sudah bisa akses bu MySAPK nya ?</p>	2023-02-13 18:24:17.761061+07	2023-02-13 18:24:17.761061+07	assignee	master|40	f	f
76	ea572511-e79c-438d-b2c9-57461f824877	<p>Sudah include di ppt pak irwan kwkwkw</p>	2023-02-21 21:25:45.99865+07	2023-02-21 21:25:45.99865+07	assignee	master|56543	f	f
77	ea572511-e79c-438d-b2c9-57461f824877	<p>Ta close ya nanti kalau ada pertanyaan lagi open tikwt lagi saja</p>	2023-02-21 21:26:05.810603+07	2023-02-21 21:26:05.810603+07	assignee	master|56543	f	f
78	aea2f495-f927-4ae5-89ae-d6a2185b470a	<p>Baik. Untuk penambahan gelar masih belum ada secara aplikasi. Bisa ke bidang pengembangan. Terima kasih</p>	2023-02-21 21:28:59.954115+07	2023-02-21 21:28:59.954115+07	assignee	master|56543	f	f
79	08257e06-61fe-45d0-a4d2-aff508366c9b	<p>Izin bertanya untuk mutasi pekerjaan dari kediei ke surabaya saya harus menghubungi siapa y kalai di BKD?</p><p><br></p><p>Mbak Ucik utk urusan mutasi CPNS sebaiknya menunggu sampai SK PNS terbit. Dan utk menguurus silahkan mengajukan melalui kepegawaian instasni masing2 ke BKD jatim di bid Mutasi. Ada syarat utama terkait mutasi yaitu ketersediaan formasi dan kebutuhan. APakah sudah pernah berkordinasi terkait hal ini ke BKD dan ke Instasni yg dituju ? mohon utk seger amenyiapkan hal tsb. DUMP. Terimakasih</p>	2023-02-22 06:51:11.21347+07	2023-02-22 06:51:11.21347+07	assignee	master|40	f	f
80	08257e06-61fe-45d0-a4d2-aff508366c9b	<p>Terima kasih bapak danar atas fast responnya,, nggeh paka saya masih belum ada gambaran sama sekalia pripun teknisnya,, saya coba cari info nggeh bapak matur nuwun</p>	2023-02-22 07:14:18.041317+07	2023-02-22 07:14:18.041317+07	requester	108416657661466806916	f	f
81	1c7609c9-3aa0-4203-a6a3-5f0d8a59c81c	<p>Dear bapak Boby </p><p><br></p><p>utk KARIS cara mengajukan bisa di pelajari di link/tautan sbb :</p><p>https://bkd.jatimprov.go.id/kariskarsu </p><p><br></p><p>Silahkan diajukan stlah menerima SK PNS terlebih dulu ngeh</p><p><br></p><p>DUMP dan terimakasih</p><p><br></p>	2023-02-23 03:13:10.802822+07	2023-02-23 03:13:10.802822+07	assignee	master|40	f	f
82	aa855d32-a369-4851-b582-b4e4e2f3e470	<p>Untuk pengangkatan CPNS menjadi PNS apakah sesuai dengan yg ada di peraturan kah min, minimal 1 tahun atau bisa lebih dari 1 tahun dari TMT CPNS? Terimakasih min. Mohon responnya 🙏🏻</p><p><br></p><p>Dear Bu Ayu</p><p><br></p><p>iyaa betul sekali sesuai PP 11/2017 perubahannya maka min 1 tahun. Dan pemprv jatim berkomitmen sebelum 1 april 2023 sudah menerima SK PNS</p><p><br></p><p>DUMP dan terimakasih</p>	2023-02-23 03:15:05.490006+07	2023-02-23 03:15:05.490006+07	assignee	master|40	f	f
83	57bcd4af-3e31-4917-9ca0-f45031fd1e24	<p><br><img src="https://siasn.bkd.jatimprov.go.id:9000/public/f5b4f2739b9db21fd5dd54025a58ce9752229886_image.png">Ibu sudah kami update e-mail dari lama ke baru</p><p>Silahkan dicoba</p><p>atau biar lancar coba japri ke WA center ya bu nomor ada di website BKD jatim</p>	2023-02-23 03:18:00.48228+07	2023-02-23 03:18:00.48228+07	assignee	master|40	f	f
84	1c4a774b-1873-4cea-b470-e572dca19630	<p>Mohon ijin bertanya Bapak/Ibu, perkenalkan sy Nurlaela Sari CPNS Formasi 2021, TMT CPNS 1 April 2022. Sy lulusan D3, Untuk ijin melanjutkan kuliah jenjang S1 apakah bisa diajukan setelah pengangkatan PNS?</p><p><br></p><p>Dear Bu Nurlela,</p><p><br></p><p>Bisa bu segera mulai skrang di pilih kampus yg terakreditasi min B utk melanjutkan jejang ke S1 dan bukan merupakan kelas jauh atau sabtu/minggu. Nanti stlah SK PNS turun bulan depan bisa langsung mengajukan dibulan april.</p><p><br></p><p>Demikian. terimakasih smga lancar</p><p><br></p><p><br></p>	2023-02-23 03:25:09.167992+07	2023-02-23 03:25:09.167992+07	assignee	master|40	f	f
85	57bcd4af-3e31-4917-9ca0-f45031fd1e24	<p>Ibu bisa chat ke WA center BKD JATIM ya</p><p>nomor ada di website bkdjatim</p>	2023-02-23 03:26:15.717465+07	2023-02-23 03:26:15.717465+07	assignee	master|40	f	f
86	7863a74a-7818-4dbb-9671-28d8ea959814	<p>hasil temuan inspektorat bahwa TPP CPNS di instansi saya salah hitung, kebanyakan dari jumlah yang seharusnya dibayarkan. Kesalahan pada salah baca PERGUB katanya, entah salah siapa. Kami disuruh mengembalikan tanpa dicicil, langsung dipotong jika TPP cair nominalnya kurang lebih 3 juta. Andai bisa dicicil sayangnya langsung dipotong, bukan salah kami tapi kami yang dirugikan. apakah tidak ada regulasi yang melindungi kami? instansi apakah tidak dapat teguran atau juga pemotongan gaji karena kelalaian yang merugikan banyak pihak?</p><p><br></p><p>Dear ASN Pemprv jatim,</p><p><br></p><p>Maaf dari ASN RSUD Dungus Madiun ya</p><p><br></p><p>Sudah pernah berkonsultasii ke kepegawaian disana ?</p><p>Saran kami segera mengajukan keberatan di BKD jatim tetapi sebelumnya bisa berkonsultasi ke WA center nanti ada admin yg mengarahkan ke bid PKPH mennagni kerugian ASN</p><p><br></p><p>DUMP dan terimakasih</p>	2023-02-23 03:28:41.05945+07	2023-02-23 03:28:41.05945+07	assignee	master|40	f	f
87	eaf81bb0-140d-4b20-bac9-527ebd380432	<p>Dear Bapak <span style="color: rgb(134, 142, 150);">AHMAD FAIZIN S.T.</span></p><p><br></p><p>Mohon maaf dari instansi mana ? apakah pihak kepegawaan sudah pernah info ke anda ? bahwa saat ini KARPEG sudah digantikan dengan kartu ASN Virtual</p><p><br></p><p>Monggo dengan menggunakan app MySAPK bisa diunduh disana ? sudah punya app MySAPK ?</p><p><br></p><p>Demikian terimakasih</p>	2023-02-23 03:31:30.221197+07	2023-02-23 03:31:30.221197+07	assignee	master|40	f	f
88	433c6db8-ea17-4dd4-b5ba-d123cec4fa15	<h2>PERSETUJUAN PENINJAUAN MASA KERJA (PMK)</h2><p>PMK adalah proses penghitungan kembali masa kerja yang dimiliki oleh PNS sebelum diangkat menjadi CPNS sesuai dengaan ketentuan. Dalam layanan ini Kanreg menerbitkan nota persetujuan teknis PMK.</p><h5>Dasar Hukum</h5><ul><li><a href="https://yogyakarta.bkn.go.id/unduhan2/uu-nomor-05-tahun-2014-aparatur-sipil-negara" rel="noopener noreferrer" target="_blank" style="color: rgb(255, 134, 0);">Undang-undang Nomor 5 Tahun 2014 Tentang Aparatur Sipil Negara</a></li><li><a href="https://yogyakarta.bkn.go.id/unduhan2/pp-nomor-11-tahun-2017-manajemen-pegawai-negeri-sipil" rel="noopener noreferrer" target="_blank" style="color: rgb(255, 134, 0);">PP Nomor 11 Tahun 2017 Tentang Manajemen Pegawai Negeri Sipil</a></li><li><a href="https://yogyakarta.bkn.go.id/unduhan2/pp-nomor-7-tahun-1977-tentang-peraturan-gaji-pegawai-negeri-sipil" rel="noopener noreferrer" target="_blank" style="color: rgb(255, 134, 0);">PP Nomor 7 Tahun 1977 Tentang Peraturan Gaji Pegawai Negeri Sipil</a></li><li><a href="https://yogyakarta.bkn.go.id/unduhan2/pp-nomor-98-tahun-2000-pengadaan-pegawai-negeri-sipil" rel="noopener noreferrer" target="_blank" style="color: rgb(255, 134, 0);">PP Nomor 98 Tahun 2000 Tentang Pengadaan Pegawai Negeri Sipil</a>&nbsp;jo&nbsp;<a href="https://yogyakarta.bkn.go.id/unduhan2/pp-nomor-11-tahun-2000-pengadaan-pegawai-negeri-sipil" rel="noopener noreferrer" target="_blank" style="color: rgb(255, 134, 0);">PP 11 Tahun 2002</a></li></ul><h5>Persyaratan</h5><ul><li>Fotocopy sah SK CPNS</li><li>Fotocopy sah SK PNS </li><li>Fotocopy sah Daftar Riwayat Pekerjaan</li><li>WAJIB Asli dan fotocopy sah SK Pengangkatan dan Pemberhentian (sebagai bukti pengalaman kerja yang diperoleh)</li><li>Fotocopy sah ijazah yang digunakan pada saat bekerja di instansi pemerintah/swasta</li><li>Bukti lain yang dimiliki oleh CPNS/PNS yang bersangkutan untuk menguatkan perhitungan masa kerja</li><li>Surat pengantar dari instansi</li><li>Kartu ASN Virtual/Karpeg</li></ul><p><br></p>	2023-02-23 06:47:07.73556+07	2023-02-23 06:47:07.73556+07	assignee	master|40	f	f
89	0066fad9-9e93-4844-b75c-fc269469f579	<p>Ya betul sekali mbak utk instansi pemerintah akan di hitung penuh dan jika swasta hanya separuh.</p><p> kemudian ketentuan umum adalah sbb :</p><p><br></p><h2>PERSETUJUAN PENINJAUAN MASA KERJA (PMK)</h2><p>PMK adalah proses penghitungan kembali masa kerja yang dimiliki oleh PNS sebelum diangkat menjadi CPNS sesuai dengaan ketentuan. Dalam layanan ini Kanreg menerbitkan nota persetujuan teknis PMK.</p><h5>Dasar Hukum</h5><ul><li><a href="https://yogyakarta.bkn.go.id/unduhan2/uu-nomor-05-tahun-2014-aparatur-sipil-negara" rel="noopener noreferrer" target="_blank" style="color: rgb(255, 134, 0);">Undang-undang Nomor 5 Tahun 2014 Tentang Aparatur Sipil Negara</a></li><li><a href="https://yogyakarta.bkn.go.id/unduhan2/pp-nomor-11-tahun-2017-manajemen-pegawai-negeri-sipil" rel="noopener noreferrer" target="_blank" style="color: rgb(255, 134, 0);">PP Nomor 11 Tahun 2017 Tentang Manajemen Pegawai Negeri Sipil</a></li><li><a href="https://yogyakarta.bkn.go.id/unduhan2/pp-nomor-7-tahun-1977-tentang-peraturan-gaji-pegawai-negeri-sipil" rel="noopener noreferrer" target="_blank" style="color: rgb(255, 134, 0);">PP Nomor 7 Tahun 1977 Tentang Peraturan Gaji Pegawai Negeri Sipil</a></li><li><a href="https://yogyakarta.bkn.go.id/unduhan2/pp-nomor-98-tahun-2000-pengadaan-pegawai-negeri-sipil" rel="noopener noreferrer" target="_blank" style="color: rgb(255, 134, 0);">PP Nomor 98 Tahun 2000 Tentang Pengadaan Pegawai Negeri Sipil</a>&nbsp;jo&nbsp;<a href="https://yogyakarta.bkn.go.id/unduhan2/pp-nomor-11-tahun-2000-pengadaan-pegawai-negeri-sipil" rel="noopener noreferrer" target="_blank" style="color: rgb(255, 134, 0);">PP 11 Tahun 2002</a></li></ul><h5>Persyaratan</h5><ul><li>Fotocopy sah SK CPNS</li><li>Fotocopy sah SK PNS</li><li>Fotocopy sah Daftar Riwayat Pekerjaan</li><li>WAJIB Asli dan fotocopy sah SK Pengangkatan dan Pemberhentian (sebagai bukti pengalaman kerja yang diperoleh)</li><li>Fotocopy sah ijazah yang digunakan pada saat bekerja di instansi pemerintah/swasta</li><li>Bukti lain yang dimiliki oleh CPNS/PNS yang bersangkutan untuk menguatkan perhitungan masa kerja</li><li>Surat pengantar dari instansi</li><li>Kartu ASN Virtual/Karpeg</li></ul><p><br></p>	2023-02-23 06:49:34.236144+07	2023-02-23 06:49:34.236144+07	assignee	master|40	f	f
90	e6f6b651-f891-406a-bdd0-bf1aa7039451	<p>selamat pagi, perkenalkan saya yudi dari divisi ...</p><p><br></p><p>cpns p3k teknis dilaksanakan pada tanggal sekian....</p><p>terima kasih</p>	2023-03-02 10:49:58.376581+07	2023-03-02 10:49:58.376581+07	assignee	master|95	f	f
91	e6f6b651-f891-406a-bdd0-bf1aa7039451	<p>oh baik kalu begitu terima kasih</p>	2023-03-02 10:50:44.868974+07	2023-03-02 10:50:44.868974+07	requester	103921334554472834759	f	f
92	e6f6b651-f891-406a-bdd0-bf1aa7039451	<p>clear ya saya close tiketnya kalau ada perntanyaan silahkan open tiket lagi</p>	2023-03-02 10:51:04.608381+07	2023-03-02 10:51:04.608381+07	assignee	master|95	f	f
93	cf74bd69-35f8-477e-a218-0b0a6216cb70	<p>selamat siang ibu, perkenalkan nama saya iput dari p3dasi.</p><p><br></p><p>untuk kesalahan dibagian mana ya? apa di bagian nama, atau unor?</p>	2023-03-03 14:35:02.705953+07	2023-03-03 14:35:02.705953+07	assignee	master|56543	f	f
94	cf74bd69-35f8-477e-a218-0b0a6216cb70	<p><br><img src="https://siasn.bkd.jatimprov.go.id:9000/public/de040e3fff562c6d8e4c62db7ee7bc6a69195667_image.png"></p><p>sebelah sini yang salah</p>	2023-03-03 14:36:23.385876+07	2023-03-03 14:36:23.385876+07	assignee	master|56543	f	f
95	fdf83f2f-706c-480a-9080-d4736ee70f93	<p>ok</p>	2023-03-03 14:49:26.624331+07	2023-03-03 14:49:26.624331+07	assignee	master|56543	f	f
96	fdf83f2f-706c-480a-9080-d4736ee70f93	<p>apanya yang ok pak?</p>	2023-03-03 14:49:48.73222+07	2023-03-03 14:49:48.73222+07	requester	master|56552	f	f
97	fdf83f2f-706c-480a-9080-d4736ee70f93	<p>ok siap</p>	2023-03-03 14:49:58.870882+07	2023-03-03 14:49:58.870882+07	assignee	master|56543	f	f
99	79721281-b742-47e5-abb6-598c59e5c3be	<p>Selamat siang Bapak ADI SUTITO, M.Pd. , </p><p>saya Intan dari BKD Jatim</p><p>Untuk SK KP IV/c an : <strong style="background-color: rgba(250, 250, 250, 0.086);">ADI SUTITO,M.Pd dari UPT </strong><strong>SMKN 1 PARON Ngawi,</strong></p><p><span style="background-color: rgba(250, 250, 250, 0.086);">masih proses pembuatan naskah SK karena Nota Persetujuan Teknis KP bapak baru turun dari BKN Jakarta.</span></p><p><span style="background-color: rgba(250, 250, 250, 0.086);">Apabila Petikan SK KP sudah selesai, Pengelola Kepegawaian dari Cabang Dinas Pendidikan Wilayah Madiun akan menghubungi operator sekolah Bapak, Terimakasih.</span></p>	2023-03-03 15:55:26.843286+07	2023-03-03 15:55:26.843286+07	assignee	master|56545	f	f
100	f9c67d42-3751-4295-b61f-5074a96f8394	<p>Dear Ibu Arum ,</p><p><br></p><p>info terbaru tes p3k teknis akan di mulai tgl 17 Maret 2023 sebagaimaba surat BKN sbb :</p><p><br></p><p><br><img src="https://siasn.bkd.jatimprov.go.id:9000/public/246a424efacee2f9d402ef46e30eede9d44b5e80_image.png"></p>	2023-03-03 20:47:51.953492+07	2023-03-03 20:47:51.953492+07	assignee	master|40	f	f
101	74e03d35-8f37-4d70-b5b5-0ace4ce7ea00	<p>Baik bapak Budi, terima kasih sudah bertanya kepada kami </p><p><br></p><p>Untuk usul pensiun ASN di wilayah kabupaten/kota , bisa diusulkan ke BKD Kabupaten/Kota masing-masing . Dan tugas (PIC) usulan Pensiun adalah wewenang BKD Kabupaten/Kota tersebut </p><p>Kami BKD Provinsi hanya melayani usulan Pensiun untuk ASN Provinsi Jawa Timur. Terima kasih  </p>	2023-03-06 12:51:08.249781+07	2023-03-06 12:51:08.249781+07	assignee	master|56548	f	f
102	8ac8787c-5c6b-4152-98e1-7cb6de1a2fd7	<p>Waalaikumsalam, terima kasih atas pertanyaan yg telah diajukan kepada kami </p><p><br></p><p>Utk persyaratan mutasi masuk ke Pemerintah provinsi jawa Timur adalah sebagai berikut : </p><p><br></p><p><br><img src="https://siasn.bkd.jatimprov.go.id:9000/public/dd2ef95b4d64b6e265286e9d65eaf1ceea8b5800_image.png"></p>	2023-03-06 14:41:40.400753+07	2023-03-06 14:41:40.400753+07	assignee	master|56548	f	f
103	c74af5ae-0037-472f-894e-b8e5e5e49829	<p>selamat sore juga pak ridho, perkenalkan saya Chelsi dari bidang PKPH BKD Jatim. </p><p>untuk tanggal 20-21 maret 2023 diperbolehkan mengambil cuti walaupun setelah jadwal cuti merupakan tanggal merah, karena tidak ada ketentuan yang tidak memperbolehkan untuk mengambil cuti sebelum/sesudah tanggal merah (cuti bersama/hari libur nasional). </p><p>terimakasih.</p>	2023-03-06 14:55:33.625089+07	2023-03-06 14:55:33.625089+07	assignee	master|58521	f	f
104	91545bd4-8982-479a-a687-9baba29c31c7	<p>waalaikumsalam wr.wb</p><p>saya chelsi dari bidang PKPH BKD Jatim.</p><p>terimakasih atas pertanyaannya terkait adanya buku petunjuk atau video akan kami sampaikan kepada sub bidang terkait, atau jika masih bingung dengan pengerjaan SKP bisa langsung datang ke kantor BKD bidang PKPH. Terimakasih.</p>	2023-03-06 15:16:59.341496+07	2023-03-06 15:16:59.341496+07	assignee	master|58521	f	f
105	48dcd28b-6f08-4173-a241-a628eaaed316	<p>Halo bapak sudarsono,</p><p>perkenalkan saya Iput dari Bidang P3DASI. Saya yang bertanggung jawab pada sistem aplikasi penilaian PTTPK.</p><p>Ketika ada pemberitahuan akun anda sedang diblokir bisa saja password anda salah.</p><p>Pastikan terlebih dahulu password anda sama dengan akun yang ada pada link <a href="bkd.jatimprov.go.id/pttpk" rel="noopener noreferrer" target="_blank">bkd.jatimprov.go.id/pttpk</a></p><p>Anda bisa melakukan reset password jika ingin merubah password, baik itu secara personal / melalui fasilitator pttpk.</p><p><br></p><p>Terima kasih.</p><p>Tiket saya tutup apabila tidak ada pertanyaan 2x24 jam</p>	2023-03-07 05:09:32.394618+07	2023-03-07 05:09:32.394618+07	assignee	master|56543	f	f
106	dd70db0a-82c8-4f9e-9bcb-8ad30c43ad9b	<p>ok fix</p>	2023-03-07 05:12:12.056941+07	2023-03-07 05:12:12.056941+07	assignee	master|56543	f	f
107	cbcd7b76-6daa-4827-aee2-ce0fcefa980a	<p>Terima kasih atas pertanyaan yang telah diajukan, </p><p>Untuk persyaratan Mutasi masuk ke Pemerintah Provinsi Jawa Timur adalah sebagai berikut : </p><p><br><img src="https://siasn.bkd.jatimprov.go.id:9000/public/15b262efc5dd6ea3a65f56dcaa179d81915d3e4d_image.png"></p><p>Untuk informasi dasar hukum, mekanisme dan Prosedur dapat melihat informasi pada menu layanan Website BKD Provinsi Jawa Timur</p><p>Terima kasih,</p>	2023-03-07 09:29:36.49851+07	2023-03-07 09:29:36.49851+07	assignee	master|56548	f	f
108	ca3c60f9-d7cc-4715-9598-ddcfa37a62a0	<p>dear ibu <span style="color: rgb(134, 142, 150);">MIKKE OKTAVIANTI, ST,</span></p><p><br></p><p><span style="color: rgb(134, 142, 150);">apakah melamar p3k di pemprov jatim ? jika iya maka nanti akan ada pengumuman jadwal per sesi di setiap titik lokasi ujian !</span></p><p><span style="color: rgb(134, 142, 150);">Jika memilih lokasi ujian kanreg 2 BKN maka nanti akan ada pengumumanlebih lanjut.</span></p><p><br></p><p><span style="color: rgb(134, 142, 150);">Demikian terimakasih.</span></p><p><br></p><p><span style="color: rgb(134, 142, 150);">Selalu cek di portal bkdjatim</span></p>	2023-03-07 21:25:33.137784+07	2023-03-07 21:25:33.137784+07	assignee	master|40	f	f
109	d0804aaf-eed8-4111-ad43-8a7a9bf8422b	<p>Baik, terima kasih atas pertanyaan yang telah disampaikan </p><p><br></p><p>Saat ini proses Kenaikan Pangkat periode April 2023 sudah bisa dicetak mandiri melalui akun MySAPK masing-masing ASN , apabila mengalami kendala error pada saat login silahkan menghubungi bidang P3DASI BKD Prov Jatim untuk dilakukan reset akun/password, apabila sudah berhasil login namun mengalami kendala error saat melakukan unduh dokumen SK KP silahkan menghubungi Pengelola Kepegawaian instansi untuk dilakukan unduh dokumen SK KP melalui akun login SIASN Pengelola Kepegawaian Instansi</p><p><br></p><p>Terima Kasih,  </p>	2023-03-08 08:59:43.949818+07	2023-03-08 08:59:43.949818+07	assignee	master|56548	f	f
110	afe0c694-b8ff-4b8a-b896-d7f0b9bff6f7	<p>dear bapak <span style="color: rgb(134, 142, 150);">MUHAIMIN</span></p><p><br></p><p><span style="color: rgb(134, 142, 150);">bapak dari instansi mana ? apakah bapak saat ini pagang akun login verifikator SIASN ?</span></p><p><span style="color: rgb(134, 142, 150);">jika iya maka silahkan update/perbaiki hanya di UNOR dam jabatan sesuai di SIMASTER menggunakan aplikasi kami : </span></p><p>https://siasn.bkd.jatimprov.go.id/sapk/</p><p><br></p><p>Demikian semoga bisa memfasiilitasi</p><p><br></p><p>Terimakasih</p>	2023-03-08 09:49:16.161296+07	2023-03-08 09:49:16.161296+07	assignee	master|40	f	f
111	148abb4a-ff0f-4ffb-9bff-362b7d01f1b3	<p>Dear Bpk <span style="color: rgb(134, 142, 150);">bayu segoro,</span></p><p><br></p><p><span style="color: rgb(134, 142, 150);">Untuk pengumuman P3k Guru Pemprov Jatim yg membawahi SMA/SMK/PKLK akan di umumkan di website bkdjatim dalam minggu ini. </span></p><p><span style="color: rgb(134, 142, 150);">Utk detail penempatan sudah tersedia di akun SSCASN masing.</span></p><p><br></p><p><span style="color: rgb(134, 142, 150);">Demikian utk menjadi perhatian dan terimkasih</span></p>	2023-03-08 19:41:53.944717+07	2023-03-08 19:41:53.944717+07	assignee	master|40	f	f
112	3774e439-f48d-465a-a8f0-a7827874ded9	<p>Dear Bpk arif devit dari probolinggo.</p><p><br></p><p>Apa sudah cek di akun SSCASN masing2 ? karena hampir semua sudah muncul penempatannya per jam 18.00 malam ini.</p><p><br></p><p>Demikian terimaaksih</p>	2023-03-08 19:43:27.067244+07	2023-03-08 19:43:27.067244+07	assignee	master|40	f	f
113	4d8e8632-ab34-45e0-860a-3b0aa5c31de7	<p>Dear Pelamar P3k<span style="color: rgb(134, 142, 150);">,</span></p><p><br></p><p><span style="color: rgb(134, 142, 150);">Untuk pengumuman P3k Guru Pemprov Jatim yg membawahi SMA/SMK/PKLK akan di umumkan di website bkdjatim dalam minggu ini. </span></p><p><span style="color: rgb(134, 142, 150);">Utk detail penempatan sudah tersedia di akun SSCASN masing.</span></p><p><br></p><p><span style="color: rgb(134, 142, 150);">Demikian utk menjadi perhatian dan terimkasih</span></p>	2023-03-08 19:45:12.090111+07	2023-03-08 19:45:12.090111+07	assignee	master|40	f	f
114	67bfa502-7631-4811-85a0-fd8462aee3b8	<p>Dear Pelamar p3k guru<span style="color: rgb(134, 142, 150);">,</span></p><p><br></p><p><span style="color: rgb(134, 142, 150);">Untuk pengumuman P3k Guru Pemprov Jatim yg membawahi SMA/SMK/PKLK akan di umumkan di website bkdjatim dalam minggu ini. </span></p><p><span style="color: rgb(134, 142, 150);">Utk detail penempatan sudah tersedia di akun SSCASN masing.</span></p><p><br></p><p><span style="color: rgb(134, 142, 150);">Demikian utk menjadi perhatian dan terimkasih</span></p>	2023-03-08 19:45:52.007062+07	2023-03-08 19:45:52.007062+07	assignee	master|40	f	f
116	7a7d8965-7484-4fe1-b2f5-cb102ec8d92a	<p>halo bapak muhaimin,</p><p>perkenalkan saya iput dari P3DASI yang membidangin SIASN.</p><p><br></p><p>Untuk peremejaan data pada SIASN sebenarnya bisa menggunakan aplikasi MySAPK pada masing-masing pegawai akan tetapi sekarang masih ditutup.</p><p>Selain itu peremajaan data juga bisa dilakukan menggunakan SIASN akan tetapi yang dapat meremajakan adalah pegawai yang ditunjuk sebagai verifikator dan approval dengan cara input usul.</p><p><br></p><p>Kalau dilihat dari perkataan bapak. Kemungkinan bapak berasal dari cabdin/sekolah</p><p>di cabdin kami sudah membagi masing-masing cabdin sebagai verifikator tapi untuk merubah nya butuh di approv oleh dindik.</p><p><br></p><p>Dan juga tidak semua data dapat diremajakan, ada yang perlu diverifikasi oleh BKN seperti pendidikan, masa kerja, dan gelar.</p><p>Terima kasih.</p><p><br></p><p>Tiket ini saya tutup 2x24 jam ya..</p><p>Nanti bapak bisa open tiket lagi kalau ada pertanyaan</p><p><br></p>	2023-03-09 06:08:00.067887+07	2023-03-09 06:08:00.067887+07	assignee	master|56543	f	f
115	67bfa502-7631-4811-85a0-fd8462aee3b8	<p>Pak mohon maaf izin tanya sekali lagi. Ini untuk lokasi penempatan kok berubah jauh, sekolah induk saya di smkn 1 bringin kab ngawi kok sekarang malah penempatan di smkn 2 kraksaan kab probolinggo.</p><p>Padahal Di sekolah induk juga membuka formasi untuk jurusan yang saya lamar.</p><p>Mohon infonya pak</p><p>Terima kasih</p>	2023-03-08 20:23:23.686564+07	2023-03-08 20:23:23.686564+07	requester	109993441263825023282	f	f
117	6239be5a-bae8-42f3-8ef6-5ca9af20874d	<p>Dear bapak Yusda</p><p><br></p><p>laman sscn akun saya tidak bisa digunakan untuk mengecek penempatan saya dalam formasi PPPK, saya bisa memperoleh file peserta yang lolos PPPK Pemprov Jatim untuk formasi guru agama Islam di mana ya?</p><p><br></p><p>Maaf sekolah asal bapak dari mana ? apakah sampai hari ini sudah di cek di akun SSCASN masing2 ? sudah tertera formasi penempatanya dmana ?</p><p>Jika belum mohon ditunggu kami akan umumkan secara resmi dalam waktu dekat,</p><p><br></p><p>Terimakasih</p>	2023-03-09 14:14:34.486542+07	2023-03-09 14:14:34.486542+07	assignee	master|40	f	f
118	9ba97736-6c05-480e-8099-1bfc60554a34	<p>Maaf kami pemprov jatim, utk pemkab Pameksan monggo ke pportal bkd pamekasan ya</p><p><br></p><p>https://bkd.jatimprov.go.id/Rekrutmen-PPPK2022/detail/baca/pengumuman/jadwal-seleksi-kompetensi-penerimaan-pegawai-pemerintah-dengan-perjanjian-kerja-pppk-tenaga-teknis-di-lingkungan-pemerintah-provinsi-jawa-timur-tahun-anggaran-2022</p>	2023-03-09 16:24:19.083061+07	2023-03-09 16:24:19.083061+07	assignee	master|40	f	f
119	7d3628c8-999f-4312-9b3e-5889aeb4b163	<p>Bisa, silahkan berkoordinasi terlebih dahulu dengan BKD/BKPSDM/Instansi Asal yang menangani kepegawaian terkait mekanisme Ujian Dinas untuk selanjutnya dapat dilakukan kerjasama terkait penyelenggaraan/fasilitasi Ujian Dinas oleh BKD Prov. Jatim</p>	2023-03-09 18:30:57.946234+07	2023-03-09 18:30:57.946234+07	assignee	master|56553	f	f
120	7d3628c8-999f-4312-9b3e-5889aeb4b163	<p>Terimakasih bu atas informasinya 🙏</p>	2023-03-10 15:27:15.269519+07	2023-03-10 15:27:15.269519+07	requester	105126464846449076179	f	f
121	310aabc8-0177-4c8c-b3de-58a056a228a9	<p>selamat pagi perkenalkan nama saya iput dari bidang p3dasi</p><p><br></p><p>saat ini pada masa jawab sanggah sampai tanggal 17 maret 2023</p><p><br></p><p>untuk lebih jelasnya ke link ini <a href="https://bkd.jatimprov.go.id/Rekrutmen-PPPK2022/detail/baca/pengumuman/penyampaian-hasil-seleksi-kompetensi-pengadaan-pppk-guru-2022-di-lingkungan-pemerintah-provinsi%C2%A0jawa%C2%A0timur" rel="noopener noreferrer" target="_blank">https://bkd.jatimprov.go.id/Rekrutmen-PPPK2022/detail/baca/pengumuman/penyampaian-hasil-seleksi-kompetensi-pengadaan-pppk-guru-2022-di-lingkungan-pemerintah-provinsi%C2%A0jawa%C2%A0timur</a></p><p><br></p><p>sukses buat kamu ya</p>	2023-03-15 09:22:22.708026+07	2023-03-15 09:22:22.708026+07	assignee	master|56543	f	f
122	3b12d29e-ce1a-4fb8-9548-6bb7fbb89c75	<p>Untuk pengumuman lihat berikut ini <a href="https://bkd.jatimprov.go.id/Rekrutmen-PPPK2022/detail/baca/pengumuman/penyampaian-hasil-seleksi-kompetensi-pengadaan-pppk-guru-2022-di-lingkungan-pemerintah-provinsi%C2%A0jawa%C2%A0timur" rel="noopener noreferrer" target="_blank">https://bkd.jatimprov.go.id/Rekrutmen-PPPK2022/detail/baca/pengumuman/penyampaian-hasil-seleksi-kompetensi-pengadaan-pppk-guru-2022-di-lingkungan-pemerintah-provinsi%C2%A0jawa%C2%A0timur</a> </p><p><br></p><p>berkaitan dengan penempatan, BKD sudah berkoordinasi dengan cabang dinas setempat agar melakukan pendataan bagi P3K guru yang tidak sesuai penempatannya. Keputusan ACC atau tidak tergantung pada proses pemetaan.</p><p><br></p><p>Seluruh proses seleksi P3K guru, dilaksanakan oleh KEMENDIKBUD. Tugas Panitia BKD hanya menyampaikan pengumuman kelulusan sejumlah 2.447 orang.</p><p><br></p><p>Terima kasih sukses ya... </p>	2023-03-15 09:41:36.076804+07	2023-03-15 09:41:36.076804+07	assignee	master|88	f	f
123	7296931e-869c-4c2d-94d8-b06d27f0f8c2	<p>test 123</p>	2023-03-15 09:47:04.764729+07	2023-03-15 09:47:04.764729+07	assignee	master|56543	f	f
124	7296931e-869c-4c2d-94d8-b06d27f0f8c2	<p>tests</p>	2023-03-15 09:47:15.025771+07	2023-03-15 09:47:15.025771+07	requester	master|88	f	f
125	8205714d-18b5-40bd-a1d2-baef0c6a6c17	<p>Selamat siang ibu faizatul,</p><p>Perkenalkan nama saya Iput dari bidang P3DASI yang membidangi SIASN dan MySAPK.</p><p><br></p><p>Pembaruan data dari MySAPK sekarang masih ditutup, apabila ada perubahan data bisa ke cabang dinas ibu untuk diinputkan usulannya.</p><p>Akan tetapi untuk perubahan data gaji  sepengatahuan saya belum ada. Sementara yang saat ini untuk dilakukan perubahan data </p><p>adalah nama / nip yang salah, jabatan dan unor.</p><p><br></p><p>Terima kasih. </p><p></p>	2023-03-16 13:13:03.758747+07	2023-03-16 13:13:03.758747+07	assignee	master|56543	f	f
126	9c8ee129-5a6f-4f42-a877-24ac49c19578	<p>Terima kasih atas pertanyaan bapak, untuk pensiun BUP masih dalam proses pengerjaan dan sudah diinput ke sistem SIASN untuk diverifikasi terlebih dahulu</p><p>Mohon untuk bersabar dan tunggu untuk prosesnya</p><p><br><img src="https://siasn.bkd.jatimprov.go.id:9000/public/8071ea29128573765c0e28bfdf058ad69c55032b_image.png"></p>	2023-03-17 08:50:40.986808+07	2023-03-17 08:50:40.986808+07	assignee	master|56548	f	f
127	a8cedb92-5b54-4f6d-8da2-506222c2d6e9	<p>Waalaikumsalam, terima kasih atas pertanyaan yang telah diajukan</p><p><br></p><p>Untuk update peninjauan masa kerja dan riwayat pangkat pada MySAPK sampai saat ini memang masih belum dapat dilakukan update secara mandiri, proses update riwayat PMK dan pangkat dapat dilakukan melalui login verifikator/pengelola SIASN pada instansi masing-masing </p><p><br></p><p>Terima kasih,</p>	2023-03-17 08:57:18.007475+07	2023-03-17 08:57:18.007475+07	assignee	master|56548	f	f
128	f66debb2-d835-4bdf-882f-b4d1c1519335	<p>Waalaikumsalam wr.wb</p><p><br></p><p>Untuk pengajuan peninjauan masa kerja/PMK apabila masih terkendala proses di Cabang Dinas Pendidikan Kab Tulungagung bisa langsung menghubungi Bidang Mutasi Badan Kepegawaian Daerah Provinsi Jawa Timur, atau bisa menghubungi WA Center website BKD Provinsi Jawa Timur</p>	2023-03-17 09:00:09.040322+07	2023-03-17 09:00:09.040322+07	assignee	master|56548	f	f
129	6ae61b89-c4f8-4767-8d57-a67c8f61116c	<p>Waalaikumsalam, wr.wb</p><p><br></p><p>Terkait isu bahwa&nbsp;penerimaan SK PNS dan Sumpah PNS dibarengi dengan SK Jabatan Fungsional, sementara ini peraturan di Provinsi Jawa Timur sesuai prosedur masih mengangkat PNS dan Sumpah PNS dahulu, kemudian baru dilakukan usulan pengangkatan Jabatan Fungsional, dan untuk informasi bahwa Jabatan Fungsional tidak menggunakan dupak namun konversi menggunakan SKP itu masih menunggu Juknis regulasi dari Kemenpan RB</p><p><br></p><p>Terima kasih,</p>	2023-03-17 09:08:22.626672+07	2023-03-17 09:08:22.626672+07	assignee	master|56548	f	f
130	fb9d5b01-ee7f-4f0c-906a-9300792a51a6	<p>Terima kasih atas pertanyaan yang telah diajukan, </p><p><br></p><p>Berikut adalah persyaratan mutasi masuk ke Provinsi Jawa Timur:</p><p><br><img src="https://siasn.bkd.jatimprov.go.id:9000/public/1c36c196f351f53e69382ef9be7300af5399de49_image.png"></p>	2023-03-17 09:11:34.027203+07	2023-03-17 09:11:34.027203+07	assignee	master|56548	f	f
131	4b0cf16b-4ba7-4ab5-9319-7d3904ffb336	<p>Terima kasih atas pertanyaan yang telah diajukan</p><p><br></p><p>Untuk pengajuan dan syarat mutasi bisa berkoordinasi dahulu melalui pengelola kepegawaian instansi masing-masing , nanti pengelola kepegawaian akan berkoordinasi lebih lanjut ke BKD Provinsi Jawa Timur terkait formasi yang kosong atau dibutuhkan</p><p><br></p><p>Terima kasih,</p>	2023-03-17 09:15:21.499747+07	2023-03-17 09:15:21.499747+07	assignee	master|56548	f	f
132	86d183bd-a333-4bcc-b929-16197c6f4093	<p>Terima kasih atas pertanyaan yang telah diajukan, </p><p><br></p><p>Sesuai dengan SK Pengangkatan PNS, memang belum diperkenankan untuk mutasi pegawai, namun dapat melakukan koordinasi dahulu dengan pengelola kepegawaian instansi masig-masing. Agar nanti bisa disampaikan lebih lanjut ke Bidang yang menangani melalui pengelola kepegawaian instansi nya </p><p><br></p><p>Terima kasih,</p>	2023-03-17 09:18:46.658284+07	2023-03-17 09:18:46.658284+07	assignee	master|56548	f	f
133	6e169dcd-ec24-45d4-9e0e-b94fa4f3865d	<p>Terima kasih atas pertanyaan yang telah diajukan, </p><p><br></p><p>Berikut untuk persyaratan mutasi masuk Provinsi Jawa Timur :</p><p><br><img src="https://siasn.bkd.jatimprov.go.id:9000/public/3efc4c956a6ea13c0af9642396847a50662edce3_image.png"></p><p>Sebelumnya juga dapat koordinasi dahulu dengan pengelola kepegawaian instansi atau BKD asal </p><p>Terima kasih,</p>	2023-03-17 09:20:32.565491+07	2023-03-17 09:20:32.565491+07	assignee	master|56548	f	f
134	51e8c056-0de2-4ead-b72b-d0d04c3beb11	<p>Selamat Siang</p><p>Saya Hendro Suryono mau menanyakan apakah PPPK Guru Boleh Sanggah / Keberatan Penempatan Unit Kerja Baru karena jarak dengan domisili terlalu jauh dengan unit kerja yang baru, serta tidak ada nya dan sulitnya akses akomodasi transportasi umum menuju ke lokasi unit kerja baru sehingga kesulitan menuju ke lokasi lembaga sekolah tersebut dikarena daerah khusus ( Daerah Pegunungan )</p><p>Mohon Kebijakan dari bapak/ibu kepala BKD PROV. JATIM akan permasalahan yang terjadi di PPPK 2022</p><p>Atas Perhatiannya saya ucapkan mohon maaf dan terima kasih.</p>	2023-03-17 09:39:35.48511+07	2023-03-17 09:39:35.48511+07	requester	104052548613068363671	f	f
135	ad827c59-3c04-48b5-9881-8190ece7463e	<p>Selamat siang, dengan saya agent chelsi dari bidang PKPH BKD Jatim.</p><p>akan saya tanyakan kepada sub bidang yang mengerjakan, jika berkenan mohon diinfokan PNS yang bersangkutan dari instansi mana dan kapan menyerahkan pengajuan karsu tersebut?</p>	2023-03-17 12:43:17.477072+07	2023-03-17 12:43:17.477072+07	assignee	master|58521	f	f
136	6d9dcd44-69e6-4228-94ee-671f1e309247	<p>Beasiswa terkait apa?</p><p><br></p><p>Informasi selengkapnya terkait beasiswa dapat diakses melalui website BKD Prov. Jatim https://bkd.jatimprov.go.id/ </p>	2023-03-17 12:44:13.294451+07	2023-03-17 12:44:13.294451+07	assignee	master|56553	f	f
138	33d0a4da-5ad9-4c2e-b0be-93c89673560a	<p>Selamat siang, dengan agent chelsi bidang PKPH BKD Jatim.</p><p>untuk materi BKD bisa diakses di link ini</p><p>https://bkd.jatimprov.go.id/berita/detail/2023/03/10/materi-penguatan-mental-rohani-dan-peningkatan-etos-kerja-bagi-anggota-korpri-tahun-2023--9--10-maret-2023</p><p>terimakasih.</p>	2023-03-17 12:45:31.143813+07	2023-03-17 12:45:31.143813+07	assignee	master|58521	f	f
139	cd2a9f72-4b17-40b4-9aa9-a3aed6c71ae3	<p>Kami belum mengadakan layanan legalisir online, jika ingin melakukan legalisir izin belajar silahkan langsung datang ke BKD Prov. Jatim</p>	2023-03-17 12:47:17.583236+07	2023-03-17 12:47:17.583236+07	assignee	master|56553	f	f
140	56c68b7c-4147-4a39-8a28-6d746f3d3b1e	<p>Siapa saja prioritas 1 PPPK?</p><p>P1 atau pelamar satu yang prioritas adalah&nbsp;<strong>mereka yang berasal dari</strong></p><ol><li><strong>THK II,</strong></li><li><strong>guru non-ASN di sekolah negeri,</strong></li><li><strong>dan lulusan PPG</strong></li><li><strong>maupun guru swasta yang sudah lulus passing grade pada seleksi 2021</strong></li></ol><p>urutan nya seperti itu kak</p>	2023-03-17 20:50:49.605636+07	2023-03-17 20:50:49.605636+07	assignee	master|88	f	f
141	86c86e49-4394-4450-ae42-9b9be7df1090	<p>untuk pemberkasan PPPK Tenaga Kesehatan</p><p>dari 9 orang</p><p>8 sudah pemberkasan</p><p>1 tidak melanjutkan</p>	2023-03-17 20:59:34.266629+07	2023-03-17 20:59:34.266629+07	assignee	master|88	f	f
142	3435d1f6-195c-4be4-8799-05528090671d	<p>Kepada : Ibu Elvin firmanda</p><p><br></p><p>utk undangan PDF bisa di share ke adc ibu kepala BKD No 0813-5725-2632 atau front liner WA : 0857-3254-3201</p><p><br></p><p>kami tunggu dan terimakasih atas kerjasamnya.</p><p><br></p><p>hormat kami,</p><p><br></p><p>team helpdesk BKD Jatim</p>	2023-03-18 06:27:36.513607+07	2023-03-18 06:27:36.513607+07	assignee	master|40	f	f
143	7590641b-e743-414e-b232-d80524fda2d5	<p>Saya Pak Karnadi, staf DitPPG GTK kemdikbud, sudah berkirim surat undangan seminar di Unessa Surabaya. Saya mohon kontak person Kantor BKD Malang, Sidoarjo, Gresik, Bangkalan, Batu, Jember, Madiun, Mojokerto, Lamongan, Malang, Surabaya</p><p><br></p><p>Yth. Bpk Karnadi</p><p>Team DitPPG GTK Kemdikbud</p><p><br></p><p>berikut kami share no CP dimaksud sbb :</p><ol><li>BKD Kab Malang 0812-5228-023</li><li>BKD Kab Sda 0817-589-511</li><li>BKD kab Gresik 0813-1956-6208</li><li>BKD Kab Bangklan 0823-3348-8118</li><li>BKD KOta Batu 0859-5498-0050</li><li>BKD Kab Jember 0812-1799-6476</li><li>BKD Kab Madiun 0813-3002-2023</li><li>BKD Kab Mojokerto 0812-4964-9776</li><li>BKD Kab Lamongan 0822-4411-3113</li><li>BKD Kota Malang 0812-3364-4755</li><li>BKD Kota SUrabaya 0813-3153-5347</li></ol><p>Demikian atas kerjasamnya di ucapkan terimakasih</p><p><br></p><p>Hormat kami</p><p><br></p><p>Team helpdesk BKD Jatim</p>	2023-03-18 06:44:59.490309+07	2023-03-18 06:44:59.490309+07	assignee	master|40	f	f
164	ff43bf2a-3b57-4422-aeb3-d20479a9e675	<p>Selamat siang Bapak Ahmad Mishbahuddin,</p><p><br></p><p>untuk persyaratan mutasi ke Pemprov Jatim tidak ada format khusus, asalkan&nbsp;jelas isi surat permohonan mutasi nya dan disertai materai bagi surat pernyataan tertentu yang sudah tercantum di website official BKD Prov. Jatim.</p><p><br></p><p>Semoga dapat membantu, terimakasih atas pertanyaannya ~</p>	2023-03-27 14:08:39.488526+07	2023-03-27 14:08:39.488526+07	assignee	master|56545	f	f
144	0173d681-6f30-48f4-8aff-737116bdfa02	<p><strong>Persyaratan Izin Belajar :</strong></p><p><br></p><ol><li>Surat Pengantar Instansi</li><li>SK CPNS, PNS</li><li>SK Pangkat Terakhir</li><li>SKP Terakhir</li><li>Surat Keterangan Kampus</li><li>Surat Pernyataan Izin Belajar/Atasan Langsung (Template Surat sudah tersedia pada Layanan Website BKD Prov. Jatim)</li><li>Jadwal Kuliah</li><li>Akreditasi Kampus</li></ol><p><br></p><p><strong>Alur Pengajuan Izin Belajar :</strong></p><p><br></p><ol><li class="ql-align-justify">PNS melengkapi berkas-berkas persyaratan Izin Belajar untuk selanjutnya diserahkan kepada Pengelola Kepegawaian pada masing-masing Dinas/Badan/Kantor ;</li><li class="ql-align-justify">Pengelola Kepegawaian membuat Surat Pengantar Izin Belajar ke BKD ;</li><li class="ql-align-justify">Pengelola Kepegawaian mengupload berkas-berkas usulan Izin Belajar pada Aplikasi SIMASTER ;</li><li class="ql-align-justify">Pengelola Kepegawaian melakukan konfirmasi dengan BKD terkait usulan Izin Belajar ;</li><li class="ql-align-justify">BKD memverifikasi kelengkapan/kesesuaian berkas usulan Izin Belajar pada Aplikasi SIMASTER ;</li><li class="ql-align-justify">BKD memproses lebih lanjut berkas yang memenuhi syarat (MS) sampai tahap pencetakan ;</li><li class="ql-align-justify">BKD menghubungi Pengelola Kepegawaian pada Dinas/Badan/Kantor masing-masing untuk menginformasikan usulan Izin Belajar yang telah selesai.</li></ol><p class="ql-align-justify"><br></p><p class="ql-align-justify"><strong>Surat Izin Belajar dapat terbit 3-7 hari setelah ada konfirmasi usulan Izin Belajar dari Pengelola Kepegawaian masing-masing Dinas/Badan/Kantor.</strong></p>	2023-03-20 14:28:01.363584+07	2023-03-20 14:28:01.363584+07	assignee	master|56553	f	f
145	7a1cb5d3-82f4-4c56-ae6f-ddebdc4fd4b5	<p>Dear Mas BIma,</p><p><br></p><p>Utk 2023 ini Semua pemda di focuskan utk menghabiskan menyelesaikan rekrutmen p3k. Sedangkan CPNS hanya di buka terbatas di Kementrian/Lembaga Pusat dengan jabatan terbatas dosen, jakssa, dll.</p><p><br></p><p>Demikian terimakasih</p>	2023-03-20 17:31:22.891038+07	2023-03-20 17:31:22.891038+07	assignee	master|40	f	f
146	20c77117-1d82-49d3-ac5c-ef6798b47620	<p>Terima kasih atas pertanyaan yang telah diajukan, </p><p><br></p><p>Untuk pengajuan dan syarat mutasi masuk ke Provinsi Jawa Timur adalah sebagai berikut : </p><p><br><img src="https://siasn.bkd.jatimprov.go.id:9000/public/0bfa9b2ad62c04f78dd66966f973cb32cd1b7242_image.png"></p><p>Dan juga sebelumnya harap berkoordinasi dengan pengelola kepegawaian Instansi terlebih dahulu terkait formasi yang dibutuhkan di instansi tujuan </p>	2023-03-21 08:55:29.41719+07	2023-03-21 08:55:29.41719+07	assignee	master|56548	f	f
147	46ea028b-2f65-4fe2-a748-ac6a25252180	<p>Terima kasih atas pertanyaan yang telah diajukan, </p><p><br></p><p>Untuk mutasi masuk ke Provinsi Jawa Timur dipersilahkan untuk berkonsultasi dengan pengelola kepegawaian Instansi terlebih dahulu terkait berkas dan persyaratan yang dilengkapi, juga terkait formasi yang dibutuhkan di instansi tujuan . Berikut syarat dan berkas yang dilengkapi :</p><p><br><img src="https://siasn.bkd.jatimprov.go.id:9000/public/269a275a0bce0b01f0981894f610464bccd098f7_image.png"></p>	2023-03-21 08:58:16.004237+07	2023-03-21 08:58:16.004237+07	assignee	master|56548	f	f
148	9822009c-a4da-4787-bdcd-27c742c83307	<p>Selamat sore Bapak Muhammad Mirzaq Syahrial Alafi, </p><p class="ql-align-justify">Saya Intan dr BKD Jatim ijin menjawab beberapa pertanyaan jenengan :</p><p class="ql-align-justify">1 . Apakah saat ini ada kesempatan untuk mengikuti ujian PI, dari II/b mengajukan ijazah D3 Farmasi saya?</p><p>=&gt; Sesuai dengan Pergub Jatim No 18 Tahun 2015 tentang Kenaikan Pangkat Penyesuaian Ijazah Bagi Pegawai Negeri Sipil Di Lingkungan Pemerintah Daerah Provinsi Jawa Timur, jenengan bisa mengajukan KP PI pada tahun depan periode <strong>01-04-2024</strong> mengingat Ujian kenaikan pangkat penyesuaian ijazah dapat diikuti oleh Pegawai Negeri Sipil yang telah memiliki masa kerja golongan ruang sekurang-kurangnya <strong>1 (satu) tahun pada kepangkatan minimal</strong>. Tapi sebelum mengajukan KP PI <strong>wajib mengajukan Pencantuman Gelar DIII </strong>ke kepegawaian RSUD Soetomo.</p><p>2 . Bagaimana mekanisme saya untuk bisa masuk ke dalam jabatan fungsional Asisten Apoteker kembali? Apakah melalui langkah Ujian kompetensi?</p><p>=&gt; Setelah naik pangkat II/c jenengan bisa mengusulkan UKOM mengisi jabfung Asisten Apoteker melalui Dinas Kesehatan Prov Jatim</p><p class="ql-align-justify">3 . Apakah ada kemungkinan saya bisa pindah ke bagian IT (Informasi &amp; Teknologi) dengan menggunakan ijazah S1 Komputer saya? Mengingat pada waktu konsultasi terkait perpindahan jabatan, saya berharap besar untuk bisa dimutasi ke bagian IT.</p><p class="ql-align-justify">=&gt; Bapak fokus ke asisten apoteker dulu , mengisi jabatan yg linear dengan jurusan jenengan</p><p class="ql-align-justify">4 . Bagaimana mekanisme untuk bisa penyesuai ijazah dengan S1 saya?</p><p class="ql-align-justify">=&gt; untuk II/c ke III/a dapat diusulkan KP PI setelah dua tahun minimal menduduki KP terakhir III/c dan wajib mengusulkan Pencantuman Gelar.</p><p class="ql-align-justify"><br></p><p class="ql-align-justify">Semoga dapat membantu, terimakasih</p><p><br></p>	2023-03-21 16:29:57.686562+07	2023-03-21 16:29:57.686562+07	assignee	master|56545	f	f
149	28a60737-2df7-45ab-8888-7aa44c643d67	<p>Selamat sore bapak Muhaimin, </p><p>sy intan dr BKD Jatim</p><p>Mohon diinfo NIP yang diusulkan pensiun, sy bantu check nggih</p><p>Terimakasih</p>	2023-03-21 16:33:13.256219+07	2023-03-21 16:33:13.256219+07	assignee	master|56545	f	f
150	89f8231e-251a-4bfb-9079-5bde4a3983d8	<p>Jawab :</p><p>Izin Belajar dapat diajukan ketika sudah berstatus PNS.</p><p><br></p><p class="ql-align-justify">Untuk pertanyaan ini :</p><p class="ql-align-justify">"Bagaimana kalau di instansi saya tidak ada formasi untuk sekolah yg akan saya lanjutkan ?"</p><p class="ql-align-justify">Maksudnya bagaimana?</p><p><br></p><p><strong>Persyaratan Izin Belajar :</strong></p><ol><li>Surat Pengantar Instansi</li><li>SK CPNS, PNS</li><li>SK Pangkat Terakhir</li><li>SKP Terakhir</li><li>Surat Keterangan Kampus</li><li>Surat Pernyataan Izin Belajar/Atasan Langsung (Template Surat sudah tersedia pada Layanan Website BKD Prov. Jatim)</li><li>Jadwal Kuliah</li><li>Akreditasi Kampus</li></ol><p><br></p><p><strong>Alur Pengajuan Izin Belajar :</strong></p><ol><li class="ql-align-justify">PNS melengkapi berkas-berkas persyaratan Izin Belajar untuk selanjutnya diserahkan kepada Pengelola Kepegawaian pada masing-masing Dinas/Badan/Kantor ;</li><li class="ql-align-justify">Pengelola Kepegawaian membuat Surat Pengantar Izin Belajar ke BKD ;</li><li class="ql-align-justify">Pengelola Kepegawaian mengupload berkas-berkas usulan Izin Belajar pada Aplikasi SIMASTER ;</li><li class="ql-align-justify">Pengelola Kepegawaian melakukan konfirmasi dengan BKD terkait usulan Izin Belajar ;</li><li class="ql-align-justify">BKD memverifikasi kelengkapan/kesesuaian berkas usulan Izin Belajar pada Aplikasi SIMASTER ;</li><li class="ql-align-justify">BKD memproses lebih lanjut berkas yang memenuhi syarat (MS) sampai tahap pencetakan ;</li><li class="ql-align-justify">BKD menghubungi Pengelola Kepegawaian pada Dinas/Badan/Kantor masing-masing untuk menginformasikan usulan Izin Belajar yang telah selesai.</li></ol><p class="ql-align-justify"><br></p><p class="ql-align-justify"><strong>Surat Izin Belajar dapat terbit 3-7 hari setelah ada konfirmasi usulan Izin Belajar dari Pengelola Kepegawaian masing-masing Dinas/Badan/Kantor.</strong></p>	2023-03-21 16:33:49.950782+07	2023-03-21 16:33:49.950782+07	assignee	master|56553	f	f
151	47f7f626-db64-4744-ba1e-13a260e93401	<p>Mohon menunggu sedang dalam proses. Untuk berkas yang sudah selesai dapat koordinasi langsung dengan Dinas Pendidikan Prov. Jatim</p>	2023-03-21 16:42:00.637079+07	2023-03-21 16:42:00.637079+07	assignee	master|56553	f	f
152	ae07d885-ea09-49a5-806c-46661c2991f6	<p>Selamat sore Ibu Erna Sulistiyan,</p><p>untuk Pengajuan PAK Guru, silahkan menghubungi DTK Dinas Pendidikan Prov. Jatim nggih,</p><p>Terimakasih</p>	2023-03-21 16:47:18.004027+07	2023-03-21 16:47:18.004027+07	assignee	master|56545	f	f
153	47f7f626-db64-4744-ba1e-13a260e93401	<p>Informasi terkini, surat sudah terbit dan sudah diserahkan ke Dinas Pendidikan Prov. Jatim</p>	2023-03-21 16:53:02.191518+07	2023-03-21 16:53:02.191518+07	assignee	master|56553	f	f
154	ca39b655-b477-4898-a604-1531f8d38cef	<p>Waalaikumsalam wr.wb </p><p><br></p><p>Untuk WA Center Bidang Mutasi bisa melalui nomor berikut : </p><p>0857-8681-8681</p><p>0813-3368-6171</p><p><br></p><p>Terima kasih,</p>	2023-03-24 15:27:58.363869+07	2023-03-24 15:27:58.363869+07	assignee	master|56548	f	f
155	930318bf-0629-4c13-9afe-dd25b1359463	<p>Terima kasih atas pertanyaan yang telah diajukan, </p><p><br></p><p>Sebelumnya untuk syarat dan informasi untuk Mutasi Antar Instansi, apabila Mutasi Antar Instansi dalam lingkup Pemerintah Provinsi Jawa Timur dapat berkoordinasi dahulu dengan pengelola kepegawaian masing-masing Instansi terkait formasi yang dibutuhkan </p><p><br></p><p>Terima kasih,</p>	2023-03-24 15:31:24.43963+07	2023-03-24 15:31:24.43963+07	assignee	master|56548	f	f
156	608ed4c0-39f3-4e32-9705-8c319dec2652	<p>Terima kasih atas pertanyaan yang tela diajukan,</p><p><br></p><p>Untuk persyaratan Peninjauan Masa Kerja adalah sebagai berikut : </p><ol><li>Minimal 10 tahun setelah diangkat PNS</li><li>SK PNS</li><li>SK CPNS</li><li>SKP (2 tahun terakhir)</li><li>Surat Keterangan Kerja Terakhir (bertandatangan minimal Direktur/setara Eselon 2)</li></ol>	2023-03-24 15:37:05.709875+07	2023-03-24 15:37:05.709875+07	assignee	master|56548	f	f
157	6dd268f6-4240-4d90-9145-83ed03ec9443	<p>Terima kasih atas pertanyaan yang telah diajukan, </p><p><br></p><p>Untuk administrasi dan syarat untuk mutasi masuk ke Provinsi Jawa Timur adaalah sebagai berikut :</p><ol><li>Silahkan untuk berkoordinasi dahulu dengan Pengelola Kepegawaian Instansi masing-masing / Instansi asal terkait formasi yang dibutuhkan di instansi tujuan</li><li>Melengkapi berkas sebagai berikut :</li></ol><p><br><img src="https://siasn.bkd.jatimprov.go.id:9000/public/839aa68d3315e4a90477433eae7c1d315700ba29_image.png"></p>	2023-03-24 15:48:30.724202+07	2023-03-24 15:48:30.724202+07	assignee	master|56548	f	f
158	af3d64bc-18f1-49f6-87c4-9330c1287591	<p>Mohon Ijin Apakah masih ada peluang nasib yang lebih baik bagi saya dan apakah masih bisa berkesempatan diangkat ASN atau P3K saya sudah bekerja di Instansi Pemerintahan sejak Tahun 2009 sampai sekarang secara terus menerus</p><p><br></p><p>Kepada :</p><p>Yth. Pak Agung Putro</p><p><br></p><p>Terimakasih sudah memberikan pertanyaan kepada team helpdesk BKD Jatim,</p><p>Mohon maaf pak agung bekerja di instansi mana ? pemprov jatim atau diluar pemprov ?</p><p>Non ASN sejak 2009 ya ?</p><p><br></p><p>Berkaitan dg pendataan non ASN yg dilakukan oleh BKN kita semua masih menunggu kebijakan pemerintah pusat di tahun 2023 s/d 2024 apakah masih diberikan peluang kesempatan utk menjadi ASN.</p><p>Saran kami mohon utk formasi 2023 agar selalu mencoba mengikuti seleksi agar tetap berpeluang diterima menjadi ASN.</p><p><br></p><p>Demikian semga berkenan.</p><p><br></p><p>Hormat kami</p><p><br></p><p>Team BKD Jatim</p>	2023-03-26 22:45:24.915024+07	2023-03-26 22:45:24.915024+07	assignee	master|40	f	f
159	45963a60-ebf3-4b75-9a78-6aa164467970	<p>Terima kasih atas pertanyaan yang telah diajukan,</p><p><br></p><p>Untuk alur mutasi masuk ke Pemerintah Provinsi Jawa Timur silahkan berkkordinasi dahulu dengan Pengelola Kepegawaian Instansi atau BKD asal ( Pemerintah Kabupaten Pandeglang ) terkait formasi yang dibutuhkan di Instansi tujuan. Untuk kelengkapan mutasi adalah sebagai berikut : </p><p><br><img src="https://siasn.bkd.jatimprov.go.id:9000/public/b8a18d1e62b40b3f5f83e2765617c7730dfb8407_image.png"></p><p>Terima kasih</p>	2023-03-27 09:28:07.556027+07	2023-03-27 09:28:07.556027+07	assignee	master|56548	f	f
160	a810fcbb-c7b2-4887-bb4f-221eafdd15e4	<p>Terima kasih atas pertanyaan yang telah diajukan,</p><p><br></p><p>Untuk alur mutasi masuk ke Pemerintah Provinsi Jawa Timur silahkan berkkordinasi dahulu dengan Pengelola Kepegawaian Instansi atau BKD asal ( Pemerintah Kabupaten Pandeglang ) terkait formasi yang dibutuhkan di Instansi tujuan</p>	2023-03-27 09:30:38.840238+07	2023-03-27 09:30:38.840238+07	assignee	master|56548	f	f
161	65722874-83ac-435b-b0e1-11334c9ba60f	<p>Waalaikumsalam, </p><p><br></p><p>Terima kasih atas pertanyaan yang telah diajukan, Sebelumnya Bapak/Ibu pensiunan dari TNI atau Pemerintah Provinsi Jawa Timur . Untuk klaim pensiunan apabila SK Pensiun sudah terbit bisa disampaikan ke PT Taspen Cabang sesuai domisili untuk kelanjutannya </p><p><br></p><p>Terima kasih,</p>	2023-03-27 09:34:53.863399+07	2023-03-27 09:34:53.863399+07	assignee	master|56548	f	f
162	92b84a7a-776b-43db-b853-e2f1a946aece	<p>Waalaikumsalam, Terima kasih atas pertanyaan yang telah diajukan&nbsp;</p><p><br></p><p>Untuk persyaratan Peninjauan Masa Kerja adalah sebagai berikut : </p><ol><li>Minimal 10 tahun setelah diangkat PNS</li><li>SK PNS</li><li>SK CPNS</li><li>SKP (2 tahun terakhir)</li><li>Surat Keterangan Kerja Terakhir (bertandatangan minimal Direktur/setara Eselon 2)</li></ol><p><br></p>	2023-03-27 09:41:30.032283+07	2023-03-27 09:41:30.032283+07	assignee	master|56548	f	f
163	83804d69-6aee-4e08-90fd-3690f7176671	<p>Waalaikum salam wr.wb</p><p>Terima kasih atas pertanyaan yang telah diajukan, </p><p><br></p><p>Untuk pengajuan jabatan fungsional dari IIIc ke IIId jenjang masih sama, tidak perlu mengurus jabatan fungsional, cukup membuat PAK untuk kenaikan pangkat saja </p><p><br></p>	2023-03-27 10:12:38.708348+07	2023-03-27 10:12:38.708348+07	assignee	master|56548	f	f
\.


--
-- Data for Name: tickets_histories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tickets_histories (id, user_id, ticket_id, status, created_at, updated_at, comment) FROM stdin;
\.


--
-- Data for Name: tickets_labels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tickets_labels (ticket_id, label, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tickets_reactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tickets_reactions (id, user_id, ticket_id, reaction, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tickets_subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tickets_subscriptions (user_id, ticket_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (custom_id, username, image, id, "from", role, "group", employee_number, birthdate, last_login, email, organization_id, "current_role", is_online) FROM stdin;
116535859448926827445	Iput Taufiqur Rohman	https://lh3.googleusercontent.com/a/ALm5wu3n9sSnQzTAiQhelo_Csav_J2R4XzHDkiTcRU8M=s96-c	\N	116535859448926827445	USER	GOOGLE		1970-01-01	2022-10-27 13:15:21.947+07	ctrlxandctrlv@gmail.com	\N	user	f
master|62152	IKHWANUDDIN AMd.Kep	https://master.bkd.jatimprov.go.id/files_jatimprov/62152-file_foto-20220409-156-closeUp1.jpg	62152	master	USER	MASTER	199301172022041001	1993-01-17	2023-03-21 14:38:43.436+07	ikhwanddn@gmail.com	10325010202	user	t
master|40826	ZAINAL MUTTAQIN S.Kom, M.I.Kom, CPR.	https://master.bkd.jatimprov.go.id/files_jatimprov/40826-file_foto-20220321-478-zain_set.jpg	40826	master	USER	MASTER	198606012014031001	1986-06-01	2022-11-12 08:06:15.668+07	zainjatim@gmail.com	101040401	user	t
113359564305461720000	Danar Andriyanto	https://lh3.googleusercontent.com/a/ALm5wu2qsFQV2xuufdX16Clb-NxDAOnLDGi3pcDCbIDDog=s96-c	\N	113359564305461720000	USER	GOOGLE		1970-01-01	2022-11-12 06:54:01.144+07	dns.musicstudio@gmail.com	\N	user	t
master|61442	AMALIA KARUNIA DEWANTI A.Md.Keb	https://master.bkd.jatimprov.go.id/files_jatimprov/61442-file_foto-20220911-503-Foto_kompres_1.jpg	61442	master	USER	MASTER	199307182022042001	1993-07-18	2023-02-22 05:45:41.603+07	ameluc18@gmail.com	103100201	user	t
107351795511081198993	septian smknkendal	https://lh3.googleusercontent.com/a/ALm5wu3jkCk3q1gBLJjxWhxqabIU9Ejdmh5owBNsRMht=s96-c	\N	107351795511081198993	USER	GOOGLE		1970-01-01	2022-11-12 08:28:43.219+07	septiansmknkendal@gmail.com	\N	user	t
master|56610	ACHMAD CHOIRON FATHONI S.T.	https://master.bkd.jatimprov.go.id/files_jatimprov/56610-file_foto-20221008-776-Achmad_orange.jpg	56610	master	USER	MASTER	198409102019031003	1984-09-10	2022-11-12 08:08:30.874+07	achoironf@gmail.com	1191601	user	f
109229515650600574183	DANAR ANDRIYANTO	https://lh3.googleusercontent.com/a/ALm5wu27Nvc5Fw-kB6VMeLD4i0ybzmaITtXhgFb2RFM=s96-c	\N	109229515650600574183	USER	GOOGLE		1970-01-01	2022-11-11 17:16:36.892+07	danarandriyanto76@gmail.com	\N	user	f
master|62061	RIZKYAH SEPTIN KURNIA SARI S.ST	https://master.bkd.jatimprov.go.id/files_jatimprov/62061-file_foto-20220407-758-FOTO_SET_BADAN.jpg	62061	master	USER	MASTER	199709052022042001	1997-09-05	2022-11-12 07:55:50.996+07	rizkyahseptin05@gmail.com	1081004	user	t
master|40	DANAR ANDRIYANTO S.Sos., M.Si.	https://master.bkd.jatimprov.go.id/files_jatimprov/40-file_foto-20220224-998-WhatsApp_Image_2022-02-24_at_14.37.03.jpeg	40	master	USER	MASTER	197612131998031005	1976-12-13	2023-03-27 10:05:11.447+07	dns.musicstudio@gmail.com	12302	admin	t
master|72	RATIMIN S.H.	https://master.bkd.jatimprov.go.id/files_jatimprov/72-file_foto-20160421-913-196502171992031008_resize.JPG	72	master	USER	MASTER	196502171992031008	1965-02-17	2022-11-03 13:55:02.011+07	rtm.ratimin17@gmail.com	12302	agent	f
105295214532230213818	May Latief A	https://lh3.googleusercontent.com/a/AEdFTp5Bl0V2_btAq59VB6Ddac2ZcUuXbvuat5Rk-SHsLQ=s96-c	\N	105295214532230213818	USER	GOOGLE		1970-01-01	2023-02-22 08:04:47.221+07	mayangandraini@gmail.com	\N	user	f
master|56932	RYO CAHYO PRAKOSO S.Kom.	https://master.bkd.jatimprov.go.id/files_jatimprov/56932-file_foto-20190528-858-RC_Setengah.jpg	56932	master	USER	MASTER	199305202019031011	1993-05-20	2022-11-12 07:57:26.296+07	ryocahyo.p@gmail.com	1080101	user	f
master|62420	AREEZA S.Sos	https://master.bkd.jatimprov.go.id/files_jatimprov/62420-file_foto-20220711-121-IMG_1425_(1).jpg	62420	master	USER	MASTER	199312292022041001	1993-12-29	2022-11-12 08:01:15.434+07	mail.areeza@gmail.com	1020201	user	t
master|69837	ANIDA SHOFIATUL WIDAD S.Pd.,Gr	https://master.bkd.jatimprov.go.id/files_jatimprov/69837-file_foto-20220613-721-IMG-20220613-WA0109.jpg	69837	master	USER	MASTER	199111252022212028	1991-11-25	2022-11-14 19:28:21.718+07	anidashofiatul@gmail.com	10538101102	user	t
master|26742	DEWI FISNIA S.E.	https://master.bkd.jatimprov.go.id/files_jatimprov/26742-file_foto-20180228-619-0082_dewi_fisnia.JPG	26742	master	USER	MASTER	198703252011012017	1987-03-25	2022-11-12 08:26:06.119+07	fisnia.df@gmail.com	10601	user	t
pttpk|1462	GALIH MARHENDRA	https://bkd.jatimprov.go.id/pttpk/upload_foto/1462Galih.jpg 	1462	pttpk	USER	PTTPK	113260219911220111462	1991-02-26	2022-11-12 08:31:07.568+07	marhendragalih@gmail.com	1062003	user	t
112060414309105011126	Agung Dwi Gara	https://lh3.googleusercontent.com/a/ALm5wu3mKaHKT6gg0TfMwhFf6ZmS8xgAwG074n7BqxPvSA=s96-c	\N	112060414309105011126	USER	GOOGLE		1970-01-01	2022-11-12 08:26:46.927+07	agungd63@gmail.com	\N	user	f
109656157414056517230	Dwi Nurcahyo	https://lh3.googleusercontent.com/a/ALm5wu1JX2KOgJBBjWQTHtimsNd7MZM-WW1ntZE1luTbDw=s96-c	\N	109656157414056517230	USER	GOOGLE		1970-01-01	2022-11-12 08:38:28.055+07	dwinurcahyodiedit@gmail.com	\N	user	t
master|59778	ENDANG WIJAYA TRI PAMUNGKAS S.Pd., Gr.	https://master.bkd.jatimprov.go.id/files_jatimprov/59778-file_foto-20210215-589-ENDANG_WIJAYA_TRI_PAMUNGKAS_SETENGAH_BADAN.jpg	59778	master	USER	MASTER	199407092020122020	1994-07-09	2022-11-12 08:41:30.556+07	endangwijayatripamungkas09@gmail.com	1052510011002	user	t
111311058116883442038	Lukman Puji Laksono	https://lh3.googleusercontent.com/a/ALm5wu0kX8LdAGVjXb-9e_q18yQRgt_ClUCF5VvsXF0peg=s96-c	\N	111311058116883442038	USER	GOOGLE		1970-01-01	2022-11-12 08:43:38.259+07	lukmanlaksono05@admin.sma.belajar.id	\N	user	t
master|10600	AGUS JUWONO	https://master.bkd.jatimprov.go.id/files_jatimprov/10600-file_foto-20170123-117-agus_juwono.jpg	10600	master	USER	MASTER	196410241998031002	1964-10-24	2022-11-12 08:43:40.103+07	agusjuwono64@gmail	1052610010101	user	t
102174439449906720817	Pelabuhan Bawean	https://lh3.googleusercontent.com/a/ALm5wu1TN2AFq9sXjwH1NNmr7fWlnZJW6OkhqBPHYjBl=s96-c	\N	102174439449906720817	USER	GOOGLE		1970-01-01	2022-11-12 08:45:45.171+07	pelabuhan.bawean.pprlmg@gmail.com	\N	user	t
105028706199829266272	sukmajaneka kurniawati	https://lh3.googleusercontent.com/a/ALm5wu2lp2i8il2HSR5mDmilJ7zHXZqQr7thEFDLOU5Z=s96-c	\N	105028706199829266272	USER	GOOGLE		1970-01-01	2022-11-12 08:46:03.267+07	sukma.janeka@gmail.com	\N	user	t
master|71415	AGUNG EKO SUSANTO ST	https://master.bkd.jatimprov.go.id/files_jatimprov/71415-file_foto-20220616-639-foto_agung.jpeg	71415	master	USER	MASTER	197503292022211005	1975-03-29	2022-11-12 08:46:35.858+07	agungeko9468@gmail.com	10532100117	user	t
105818923465430791974	Siti Hajar	https://lh3.googleusercontent.com/a/ALm5wu3kNFx59UmiQLEO7T7yvBTgRTyc1gcxYCfwyYC0IA=s96-c	\N	105818923465430791974	USER	GOOGLE		1970-01-01	2022-11-12 08:47:04.56+07	siti.hajar37@gmail.com	\N	user	t
106889941758926792068	MUSTA `IN	https://lh3.googleusercontent.com/a/ALm5wu0gjREBC55ys_Nv7qURUEHWk0kGZWIZ2oJWJ5D86g=s96-c	\N	106889941758926792068	USER	GOOGLE		1970-01-01	2022-11-12 08:55:07.981+07	emyueste@gmail.com	\N	user	t
103921334554472834759	p3dasi dev	https://lh3.googleusercontent.com/a/AGNmyxYK1PDkX3cOvfChQxpHn4GhBnbisqpB_37oPVvM=s96-c	\N	103921334554472834759	USER	GOOGLE		1970-01-01	2023-03-02 10:46:57.398+07	p3dasi.dev@gmail.com	\N	user	f
105503740477298041174	Iput Taufiqurrohman Suwarto	https://lh3.googleusercontent.com/a/AEdFTp4HTkt51UPV6Vl4zMVTzatgmgRRxm3eg2MmY0myFQ=s96-c	\N	105503740477298041174	USER	GOOGLE		1970-01-01	2023-02-10 10:38:36.398+07	taufiqurrohman.suwarto@gmail.com	\N	user	f
master|59488	RIZKA ROSLIANA S.Pd	https://master.bkd.jatimprov.go.id/files_jatimprov/59488-file_foto-20210224-443-rizka1.jpg	59488	master	USER	MASTER	199107102020122022	1991-07-10	2022-11-12 08:55:08.457+07	rizkarosliana87@gmail.com	1053210021302	user	t
100057519768980321515	muhammad rifki	https://lh3.googleusercontent.com/a/ALm5wu3dYopNQY3O0VBsjovn2Mcjsr5WnuWCc-vZw3JF=s96-c	\N	100057519768980321515	USER	GOOGLE		1970-01-01	2022-11-12 08:55:30.868+07	rifkimuhammad902@gmail.com	\N	user	t
103612939993410397513	samsul muawan	https://lh3.googleusercontent.com/a/ALm5wu2Ty9xm1vCotGlPI8-nY6rP4jbW_mQqylaj1B5bNA=s96-c	\N	103612939993410397513	USER	GOOGLE		1970-01-01	2022-11-12 08:58:00.677+07	samsul.muawan@gmail.com	\N	user	t
pttpk|1389	VICY PURNAMA PUTRA	https://bkd.jatimprov.go.id/pttpk/upload_foto/1389vicy_purnama_p.jpg 	1389	pttpk	USER	PTTPK	113140419900920141389	1990-04-14	2022-11-12 09:03:55.889+07	vicypurnama86@gmail.com	1061801	user	t
master|68445	DIAN WAHYU PUSPITASARI S.Pd	https://master.bkd.jatimprov.go.id/files_jatimprov/68445-file_foto-20220701-493-FOTO_SETENGAH_BADAN.jpg	68445	master	USER	MASTER	198902182022212022	1989-02-18	2022-11-12 09:09:19.623+07	dianwahyu.dwp@gmail.com	1052210023202	user	t
master|59085	ISTIANA NURCAHYANI S.Pd., Gr.	https://master.bkd.jatimprov.go.id/files_jatimprov/59085-file_foto-20211115-115-half_grey_1.jpg	59085	master	USER	MASTER	199305042020122025	1993-05-04	2022-11-12 09:09:35.701+07	istiananurcahyani@yahoo.com	10536102302	user	t
117002787547274368345	SMAN Pilangkenceng	https://lh3.googleusercontent.com/a/ALm5wu1AWwMOT13qPA9QNzFAsXdF2oylNazXulyQIlAfqQ=s96-c	\N	117002787547274368345	USER	GOOGLE		1970-01-01	2022-11-12 08:55:20.748+07	sman1pilangkenceng@gmail.com	\N	user	t
master|67134	QAHARRUDIN WIDYARTO S.Pd.,Gr.	https://master.bkd.jatimprov.go.id/files_jatimprov/67134-file_foto-20220511-164-Untitled.jpg	67134	master	USER	MASTER	198810082022211009	1988-10-08	2023-01-31 19:24:15.061+07	qaharrudin@gmail.com	1052710011502	user	t
master|67489	KRISNA YITNAWAN S.E.	https://master.bkd.jatimprov.go.id/files_jatimprov/67489-file_foto-20220619-570-IMG_20220517_173621.jpg	67489	master	USER	MASTER	198305252022211017	1983-05-25	2022-11-12 09:25:25.05+07	rhakaputrayitnawan@gmail.co.id 	1052910021502	user	t
105021664279046565654	Vina Wahyu R	https://lh3.googleusercontent.com/a/ALm5wu0gCdlAZbS2wnAnYPs6fz-B6I0CNCotWFkieW7q=s96-c	\N	105021664279046565654	USER	GOOGLE		1970-01-01	2022-11-12 09:30:21.366+07	vinawahyur@gmail.com	\N	user	t
100814177484168665980	Ali Usman Nawawi	https://lh3.googleusercontent.com/a/ALm5wu2q6nwPU0ESir04jl-CeUeZGlGAjRJ3pZtzK3gFLA=s96-c	\N	100814177484168665980	USER	GOOGLE		1970-01-01	2022-11-12 09:31:12.4+07	aliusmannawawi@gmail.com	\N	user	t
112188100669131840860	bambang subekti	https://lh3.googleusercontent.com/a/ALm5wu0mYcZMDTlM5vs--fvTp3CcW_8fMkp4ODikqJuoJA=s96-c	\N	112188100669131840860	USER	GOOGLE		1970-01-01	2022-11-12 09:33:19.698+07	subekti.biounesa@gmail.com	\N	user	t
107700546483500883671	Anggraini Nugroho P	https://lh3.googleusercontent.com/a/ALm5wu1dNpgiVlXarUSANsoQhW6I1eeOTjhvq_W1Xs7f9Q=s96-c	\N	107700546483500883671	USER	GOOGLE		1970-01-01	2022-11-12 09:37:15.345+07	anggraininugrohop@gmail.com	\N	user	t
115118215947156698669	bagus prayogo	https://lh3.googleusercontent.com/a/ALm5wu10XNdraVZ59kka-Z6gopB7DsyuFwdoWeig86SF1w=s96-c	\N	115118215947156698669	USER	GOOGLE		1970-01-01	2022-11-12 09:37:53.547+07	bagusberusaha@gmail.com	\N	user	t
114775807296498901327	su yitno	https://lh3.googleusercontent.com/a/ALm5wu1mdT6Fvulsnt65A_aP3LdaYmTZjIwHUO4SsTM=s96-c	\N	114775807296498901327	USER	GOOGLE		1970-01-01	2022-11-12 09:43:56.186+07	suyitnosdlb@gmail.com	\N	user	t
master|59153	RAHMAT TEJA YAN KUMARA S.Pd.	https://master.bkd.jatimprov.go.id/files_jatimprov/59153-file_foto-20220311-807-Pas_Foto.jpg	59153	master	USER	MASTER	199112222020121013	1991-12-22	2022-11-12 09:44:05.872+07	teteja.yankumara.2015@gmail.com	1052710012002	user	t
114219791891248452184	Arie Chandra Hermawan	https://lh3.googleusercontent.com/a/ALm5wu2vWqfzlrhX2XKVxogL1LhrPze7ZhDVmRbxEmDr=s96-c	\N	114219791891248452184	USER	GOOGLE		1970-01-01	2022-11-12 09:45:41.221+07	ariehermawan71@guru.smk.belajar.id	\N	user	t
106238840071565059834	Rajma Tri Handoko	https://lh3.googleusercontent.com/a/ALm5wu2OigM6Q84ZA-cfgdGNjsgBHoVrcf8ifwUOIFoOJg=s96-c	\N	106238840071565059834	USER	GOOGLE		1970-01-01	2022-11-12 09:46:28.293+07	rajma.1908@gmail.com	\N	user	t
master|46642	HERU SUKANDAR S.H.	https://master.bkd.jatimprov.go.id/files_jatimprov/46642-file_foto-20200427-227-heru_sukandar.jpg	46642	master	USER	MASTER	197002141990031004	1970-02-14	2022-11-12 09:48:19.273+07	herusukandar15@gmail.com	1060902	user	t
master|65684	FAIZ ZAINUL IKHSAN S.Pd.	https://master.bkd.jatimprov.go.id/files_jatimprov/65684-file_foto-20220511-884-4X6_(1).jpg	65684	master	USER	MASTER	199708252022211004	1997-08-25	2023-03-02 05:45:08.229+07	faizzainul.um@gmail.com	1053010011102	user	f
master|69362	ABDUL AZIZ S.Kom	https://master.bkd.jatimprov.go.id/files_jatimprov/69362-file_foto-20220614-463-Abdul_Aziz_Setengah_Badan.jpg	69362	master	USER	MASTER	199406232022211006	1994-06-23	2022-11-12 09:52:32.415+07	abdulazizitn@gmail.com	1052710020102	user	t
105804241394099071043	matikzone	https://lh3.googleusercontent.com/a/ALm5wu3mSli2cNFEnGIaCXtjpiAQXTtz8RFtcUP6m7kakQ=s96-c	\N	105804241394099071043	USER	GOOGLE		1970-01-01	2022-11-12 10:09:37.724+07	matikzone@gmail.com	\N	user	t
master|70834	NUR WAHYUDI S.Pd.Gr	https://master.bkd.jatimprov.go.id/files_jatimprov/70834-file_foto-20220613-241-WhatsApp_Image_2022-06-13_at_08.19.36.jpeg	70834	master	USER	MASTER	198407112022211023	1984-07-11	2022-11-12 09:54:15.2+07	nurwahyudhi4@gmail.com	1053010012002	user	t
master|68842	SOFYAN MAULIDY S.Kom.	https://master.bkd.jatimprov.go.id/files_jatimprov/68842-file_foto-20220622-584-pas_foto.jpeg	68842	master	USER	MASTER	199209012022211013	1992-09-01	2023-03-02 06:54:13.154+07	sofyanmaulidy92@gmail.com	10524100102	user	f
118381713344480928366	subagiono	https://lh3.googleusercontent.com/a/ALm5wu2PCG2iuBRT0SIxUfDB9aSRK3ML35-8caJXqd0Esw=s96-c	\N	118381713344480928366	USER	GOOGLE		1970-01-01	2022-11-12 09:56:44.324+07	subagionosb@gmail.com	\N	user	t
104376838393950326411	Bayu Rahendra	https://lh3.googleusercontent.com/a/ALm5wu3zCPgh-x10_BUegLHUq2rU94peIuGfbKuZVEnX=s96-c	\N	104376838393950326411	USER	GOOGLE		1970-01-01	2022-11-12 09:59:46.429+07	rahendrabayu0706@gmail.com	\N	user	t
100984042999958276936	Buyute Soerjo	https://lh3.googleusercontent.com/a/ALm5wu0S-e2JVGw4y4GYXqkIpqM7CrFnJHjgfjhoTXT3xA=s96-c	\N	100984042999958276936	USER	GOOGLE		1970-01-01	2022-11-12 10:05:06.501+07	buyutesoerjo@gmail.com	\N	user	t
109345213763183117705	Dian Asih	https://lh3.googleusercontent.com/a/ALm5wu2LDy8mXglN5CEYHjeVoGWMxcV51pNO2kNNuojKik4=s96-c	\N	109345213763183117705	USER	GOOGLE		1970-01-01	2022-11-12 10:05:32.122+07	dianasih287@gmail.com	\N	user	t
112997107619785331862	Dewi Solikah	https://lh3.googleusercontent.com/a/ALm5wu109toDM5Mr2WwMjrraDOKBITVa61d8DH7pjOpLAQ=s96-c	\N	112997107619785331862	USER	GOOGLE		1970-01-01	2022-11-12 10:12:05.036+07	dewisolikah59@gmail.com	\N	user	t
115634242611352447576	Aulia Sukma	https://lh3.googleusercontent.com/a/ALm5wu2nl24QHlZME-U8LylmyNqBbMWZthpVeKix0gp-=s96-c	\N	115634242611352447576	USER	GOOGLE		1970-01-01	2022-11-12 10:23:00.193+07	aulia.sukma2403@gmail.com	\N	user	t
118030064912755499107	Ferdika David	https://lh3.googleusercontent.com/a/ALm5wu2GgfT9sV_MaZ9MAqGNNmdTRm543B5s2h5A7_rI=s96-c	\N	118030064912755499107	USER	GOOGLE		1970-01-01	2022-11-12 10:23:38.126+07	davidferdika96@gmail.com	\N	user	t
master|62201	WAHYU ANDINI AMd.Keb	https://master.bkd.jatimprov.go.id/files_jatimprov/62201-file_foto-20220411-220-ANDINI_SEPARO_ABU_ABU.jpeg	62201	master	USER	MASTER	199008152022042001	1990-08-15	2022-11-12 10:26:54.558+07	wahyuandin1508@gmail.com	103220107	user	t
114128012179859985223	nafisa aulia	https://lh3.googleusercontent.com/a/ALm5wu3lPskFAMKCkvCn-_KJht-9-eVb7lBU2J-RrP8TRqQ=s96-c	\N	114128012179859985223	USER	GOOGLE		1970-01-01	2022-11-12 10:36:48.072+07	koliksmkn2@gmail.com	\N	user	t
pttpk|8177	MEILIA VIBIA,AMd.Farm	https://bkd.jatimprov.go.id/pttpk/upload_foto/81774XJ3X53718T0BP0dVdhCadtE.jpg 	8177	pttpk	USER	PTTPK	1027120519941020168156	1994-05-12	2022-11-12 10:30:55.038+07	meiliavibia12@gmail.com	14602010202	user	f
109477077164766567842	Bambang Santosa	https://lh3.googleusercontent.com/a/ALm5wu1O7FaCLCfZkgITEgsaUmmgDNFImObsDSh8WDzi=s96-c	\N	109477077164766567842	USER	GOOGLE		1970-01-01	2022-11-12 12:01:40.07+07	tkrmejayan@gmail.com	\N	user	t
master|69698	SUNARYO ST	https://master.bkd.jatimprov.go.id/files_jatimprov/69698-file_foto-20220620-786-DSC_4230_4x6_KECIL.jpg	69698	master	USER	MASTER	198004022022211016	1980-04-02	2022-11-12 10:42:55.098+07	aryogpnk020480@gmail.com	10526100117	user	t
pttpk|9800	LOKANATHA MUKHAMAD ALINTANG, S.Pd	https://bkd.jatimprov.go.id/pttpk/upload_foto/9800044_lokanatha_m_a__1547024884_36.80.79.202.jpg 	9800	pttpk	USER	PTTPK	113010619920420189758	1992-06-01	2022-11-12 10:46:10.289+07	loka.natha@yahoo.co.id	1062203	user	t
101070404691035113433	Mohammad Rasidi	https://lh3.googleusercontent.com/a/ALm5wu29x9ROmJ16OxoE6QBBP1i3ZX6VWO9uzYUPaLLY=s96-c	\N	101070404691035113433	USER	GOOGLE		1970-01-01	2022-11-12 10:49:17.743+07	mohammadrasidi1984@gmail.com	\N	user	t
pttpk|9773	ABHI BUTHI DHAGSINA	https://bkd.jatimprov.go.id/pttpk/upload_foto/9773Untitled-3.jpg 	9773	pttpk	USER	PTTPK	113170919900420189742	1990-09-17	2022-11-12 21:49:56.723+07	abhikalang@gmail.com	1062202	user	t
105414982884660758974	Dina Charisma Ganda Pratiwi	https://lh3.googleusercontent.com/a/ALm5wu0wFHVt4npDjoW51lCdGSYnuHO7yhysZrTVkXEX=s96-c	\N	105414982884660758974	USER	GOOGLE		1970-01-01	2022-11-12 10:55:45.65+07	dinapratiwi01@guru.sma.belajar.id	\N	user	t
108645022223433844798	Suwarni Suwarni	https://lh3.googleusercontent.com/a/ALm5wu2d_xZj4DXWariuD3ZN_0jxHxL2qXosSjL2uZCb=s96-c	\N	108645022223433844798	USER	GOOGLE		1970-01-01	2022-11-12 10:59:15.395+07	suwarnisuwarni626@gmail.com	\N	user	t
111247740293180230248	JOSEF IRWANTOKO	https://lh3.googleusercontent.com/a/ALm5wu3ot8PCl-IFUUTh03sFO745975aryWZYWg4i2ff=s96-c	\N	111247740293180230248	USER	GOOGLE		1970-01-01	2022-11-12 10:59:30.138+07	josefirwantoko.74@gmail.com	\N	user	t
110270258097436281823	Mufid Murtadho	https://lh3.googleusercontent.com/a/ALm5wu3s6XsGmKUoivwXXfpyjThLPyXsOj7IiRPFg4C5Qg=s96-c	\N	110270258097436281823	USER	GOOGLE		1970-01-01	2022-11-16 08:39:18.645+07	mufidmurtad@gmail.com	\N	user	t
111115756055921574714	yemima hendry	https://lh3.googleusercontent.com/a/ALm5wu2GrrB5CBZ4-0o-H3U463A31KqYcBPL0kUciiYp=s96-c	\N	111115756055921574714	USER	GOOGLE		1970-01-01	2022-11-12 11:06:50.587+07	yemima.smkn1mejayan@gmail.com	\N	user	t
master|19667	SUKADI S.Pd.	https://master.bkd.jatimprov.go.id/files_jatimprov/19667-file_foto-20191030-447-Sukadi-min.jpg	19667	master	USER	MASTER	196212182008011002	1962-12-18	2022-12-03 18:36:45.784+07	sukadispd.60@gmail.com	10526100314	user	t
105384816144510278201	muksim ansori	https://lh3.googleusercontent.com/a/ALm5wu1F7yD09TR24TW2_wjXsj2NopEVEtmDPFuK8Cfx=s96-c	\N	105384816144510278201	USER	GOOGLE		1970-01-01	2022-11-14 10:04:22.773+07	muksimansori35@gmail.com	\N	user	t
105975389323687414677	Devi Kusuma	https://lh3.googleusercontent.com/a/ALm5wu18NgwkErptm_9xSqxbdkEu3XQ0zyy6YWEX5fFc=s96-c	\N	105975389323687414677	USER	GOOGLE		1970-01-01	2022-11-12 12:25:13.512+07	devi926@guru.sma.belajar.id	\N	user	t
108634127411774354808	akasid indonesia	https://lh3.googleusercontent.com/a/ALm5wu1KZWz72fQX8cAjHz4mMFWQMAcoRoZaD52pBUpsWQ=s96-c	\N	108634127411774354808	USER	GOOGLE		1970-01-01	2022-11-12 11:24:27.043+07	saikhoni.s.hut@gmail.com	\N	user	t
pttpk|9796	EKO PRASETYO	https://bkd.jatimprov.go.id/pttpk/upload_foto/pak_eko.jpeg	9796	pttpk	USER	PTTPK	113120319820420189754	1982-03-12	2023-02-27 20:47:03.11+07	ekoprasetyo.ep59@gmail.com	1062202	user	t
master|9312	DHODHIK MAYANTORO S.Kom.	https://master.bkd.jatimprov.go.id/files_jatimprov/9312-file_foto-20160520-272-Foto_Setengah_Badan.jpg	9312	master	USER	MASTER	198205012010011024	1982-05-01	2022-11-17 17:46:07.681+07	kkpismkn4madiun@yahoo.co.id	1052610011302	user	t
107401730819126113278	Noffan Syarifuddin	https://lh3.googleusercontent.com/a/ALm5wu3rVESRIlTHMFfmQuvr_0k9bhu_DxVjeUifPqzLcg=s96-c	\N	107401730819126113278	USER	GOOGLE		1970-01-01	2022-11-12 11:47:16.784+07	novansyarifuddin54@gmail.com	\N	user	t
115201648402085603083	Nurul Arifani	https://lh3.googleusercontent.com/a/ALm5wu0JD2Ruha1lNbWcx-CGqIflpStZ-S7bs_opG1MH=s96-c	\N	115201648402085603083	USER	GOOGLE		1970-01-01	2022-11-12 15:44:29.106+07	nurul.arifani01@gmail.com	\N	user	t
master|56786	RYAN RAKHMAD HARYADHA S.T.	https://master.bkd.jatimprov.go.id/files_jatimprov/56786-file_foto-20200409-921-Ryan_RH_Full_Body.JPG	56786	master	USER	MASTER	199206122019031013	1992-06-12	2022-11-12 12:44:03.861+07	ryan.haryadha@gmail.com	1060702	user	t
master|71271	SALMAN MUBAROK ARRONI S.Pd, Gr	https://master.bkd.jatimprov.go.id/files_jatimprov/71271-file_foto-20220611-177-foto_set.jpg	71271	master	USER	MASTER	198807112022211016	1988-07-11	2022-11-12 12:52:13.147+07	mubarack886@gmail.com	10544101302	user	t
master|71127	AKHMAD AFFANDY S.Pd., Gr.	https://master.bkd.jatimprov.go.id/files_jatimprov/71127-file_foto-20220810-704-affan.jpeg	71127	master	USER	MASTER	198910312022211008	1989-10-31	2022-11-12 12:44:21.845+07	akh.affandy@gmail.com	1053110010402	user	f
110977376470497382978	Sudono 64	https://lh3.googleusercontent.com/a/ALm5wu2Ky9NfR1ZvpX_84qxGNkPmADKo-gkqf6HjBUWaJQ=s96-c	\N	110977376470497382978	USER	GOOGLE		1970-01-01	2022-11-12 12:46:52.423+07	sudonoabc@gmail.com	\N	user	t
103552401062604906194	Muhammad Sukron Mahadi	https://lh3.googleusercontent.com/a/ALm5wu1kXJlkHv29jXUhETScVyyq5TQEYG9bO4yxOlmxCg=s96-c	\N	103552401062604906194	USER	GOOGLE		1970-01-01	2022-11-12 12:58:03.938+07	sukronmahadi@gmail.com	\N	user	t
117909165866633092394	Ummi Zahroh	https://lh3.googleusercontent.com/a/ALm5wu1B2XfpeXYU0w5brZc4ir1Jw2KcAr2G-p4stMCUsg=s96-c	\N	117909165866633092394	USER	GOOGLE		1970-01-01	2022-11-12 13:07:51.458+07	ummi.zahroh79@gmail.com	\N	user	t
pttpk|1383	SOFYAN EFENDI	https://bkd.jatimprov.go.id/pttpk/upload_foto/13831.jpg 	1383	pttpk	USER	PTTPK	113010619871220111383	1987-06-01	2022-11-12 13:36:21.269+07	sofyanefendi300@gmail.com	1061804	user	t
108266671487809829381	DESY CHRISDIANA MAHASARI	https://lh3.googleusercontent.com/a/ALm5wu2I5yg2mZO4qScUrhlsb1mVbI3wYwVlGdRuyHMM=s96-c	\N	108266671487809829381	USER	GOOGLE		1970-01-01	2022-11-12 13:54:44.47+07	desy826@guru.smk.belajar.id	\N	user	t
master|62301	RATNA PUSPITASARI S. Kep., Ns.	https://master.bkd.jatimprov.go.id/files_jatimprov/62301-file_foto-20220410-281-foto_CPNS_setengah_badan.jpeg	62301	master	USER	MASTER	199103232022042001	1991-03-23	2022-11-24 09:40:02.854+07	rat.shooter9@gmail.com	10321	user	t
110088187106200729193	Dian Octavia	https://lh3.googleusercontent.com/a/ALm5wu3PmwGfymWadphrPeOHzE7NRgXCeHLD4scRJ8kWOg=s96-c	\N	110088187106200729193	USER	GOOGLE		1970-01-01	2022-11-12 14:10:06.698+07	dianocta983@gmail.com	\N	user	t
pttpk|1382	M. LUTHFI ROMADLON	https://bkd.jatimprov.go.id/pttpk/upload_foto/F1.jpg	1382	pttpk	USER	PTTPK	113221019731220111382	1973-10-22	2022-11-12 14:38:49.822+07	dhonadoni@yahoo.co.id	1061805	user	t
master|70383	DIAN OCTAVIA INDAH S.Pd.	https://master.bkd.jatimprov.go.id/files_jatimprov/70383-file_foto-20220617-769-FOTO_DIAN_SETENGAN_BADAN.jpg	70383	master	USER	MASTER	198410262022212023	1984-10-26	2022-11-12 14:57:34.046+07	dianocta983@gmail.com	1052810012302	user	t
master|49075	ANDIE KUSUMA SAKTY S.T.	https://master.bkd.jatimprov.go.id/files_jatimprov/49075-file_foto-20220202-172-andie-kusuma-s.jpg	49075	master	USER	MASTER	198707042015031003	1987-07-04	2022-11-12 15:04:23.438+07	ak.sakti@gmail.com	1060702	user	f
master|70266	SA'DULLAH S.T.	https://master.bkd.jatimprov.go.id/files_jatimprov/70266-file_foto-20220613-700-fotokusb1.jpg	70266	master	USER	MASTER	198209262022211014	1982-09-26	2022-11-12 15:13:36.281+07	sadanaja420@gmail.com	10542101302	user	t
108359196638418601621	Ahmad Muhajir	https://lh3.googleusercontent.com/a/ALm5wu0AmvPdfAvJHowIDLK9CxOPZyU0lwzt0QnSpIlc=s96-c	\N	108359196638418601621	USER	GOOGLE		1970-01-01	2022-11-12 15:16:01.906+07	a.muhajir1995@gmail.com	\N	user	t
master|68227	SUMINTO FITRIANTORO S.Pd.	https://master.bkd.jatimprov.go.id/files_jatimprov/68227-file_foto-20220613-88-Pak_Minto_Setengah_Badan.jpg	68227	master	USER	MASTER	198606112022211016	1986-06-11	2022-11-12 15:22:04.288+07	minto.history@gmail.com	1052210022202	user	t
118243554602697971240	Luhur Prihadi	https://lh3.googleusercontent.com/a/ALm5wu2Vt7LQna3rKgvYl0zPCUobokJgnWaOKd89yI7z=s96-c	\N	118243554602697971240	USER	GOOGLE		1970-01-01	2022-11-12 15:26:05.038+07	lprihadi@gmail.com	\N	user	t
116984211395035917782	Yudik Dermawan	https://lh3.googleusercontent.com/a/ALm5wu1IzH6GmbyAJSr13X0u7iHVw0Sq-etu3CZDwTex=s96-c	\N	116984211395035917782	USER	GOOGLE		1970-01-01	2022-11-12 15:35:48.859+07	yudikdermawan92@gmail.com	\N	user	t
116976112079462992331	Elcha Bagus Narendra Putra	https://lh3.googleusercontent.com/a/ALm5wu3BulUHxTuGMUG1ilEcIb3SdSOjhOjiKV8rpORY=s96-c	\N	116976112079462992331	USER	GOOGLE		1970-01-01	2022-11-12 15:48:59.705+07	elchaputra34@guru.smk.belajar.id	\N	user	t
116733235381929360448	Bram Dwinata	https://lh3.googleusercontent.com/a/ALm5wu2EvzPVGTswPxf2CZNlt4QaFLr0IoORqetPA3fY=s96-c	\N	116733235381929360448	USER	GOOGLE		1970-01-01	2022-11-12 16:15:40.887+07	bramdwinata715@gmail.com	\N	user	t
pttpk|815	TRI DIAN LIAN SARI, A.Md. Kep	https://bkd.jatimprov.go.id/pttpk/upload_foto/815imgonline_com_ua_CompressToSize_e6qRqlyDZzUQ-compress1.jpg 	815	pttpk	USER	PTTPK	10213270819860120090815	1986-08-27	2022-11-12 16:23:25.888+07	tridianliansari27@gmail.com	1030902	user	t
113773086953809216475	22_siti safarina utami	https://lh3.googleusercontent.com/a/ALm5wu0eObDEKg6m6-A_N_b7fV1K5zXmYQ4XWFdLIgxp=s96-c	\N	113773086953809216475	USER	GOOGLE		1970-01-01	2022-11-12 16:42:03.596+07	safarinautami@gmail.com	\N	user	t
116274165032493776969	Dunia Channel	https://lh3.googleusercontent.com/a/ALm5wu1uVoDwlsfueVycEkH8TvN64IuBd33ftmuRujEZ=s96-c	\N	116274165032493776969	USER	GOOGLE		1970-01-01	2022-11-12 16:47:36.723+07	akhmadfauzi038@gmail.com	\N	user	t
113989120615485334268	Riya Sriagustin	https://lh3.googleusercontent.com/a/ALm5wu2wmxjZyFKmN5NRjDPnzSJLGK2r7ZXbTFmQ5N8z6A=s96-c	\N	113989120615485334268	USER	GOOGLE		1970-01-01	2022-11-12 16:53:57.076+07	riyasriagustin31@gmail.com	\N	user	t
107895398294445282010	Deasy Oktaviya	https://lh3.googleusercontent.com/a/ALm5wu27fnxo-Uxr9sJh-6aye0G-h8T131_5wm6sTxJ4=s96-c	\N	107895398294445282010	USER	GOOGLE		1970-01-01	2022-11-15 08:30:28.547+07	deasyoktaviya21@gmail.com	\N	user	t
111062645599613143046	pebriani diana	https://lh3.googleusercontent.com/a/ALm5wu3uLkPK4PyP_Y5sOGRvAZHsYI-O7KHn1fuDS7PD=s96-c	\N	111062645599613143046	USER	GOOGLE		1970-01-01	2022-11-12 17:07:34.329+07	pebrianidiana465@gmail.com	\N	user	t
master|59547	LELLY MUSTIKASARI S.Pd	https://master.bkd.jatimprov.go.id/files_jatimprov/59547-file_foto-20210131-936-FOTO_SETENGAH_BADAN___LELLY_MUSTIKASARI_199005052020122016.jpg	59547	master	USER	MASTER	199005052020122016	1990-05-05	2022-11-12 17:57:06.714+07	mustikalelly@gmail.com	1052710011702	user	t
master|62049	OKIK ARIS SETIAWAN S.T.	https://master.bkd.jatimprov.go.id/files_jatimprov/62049-file_foto-20220416-240-Okik_Aris_Setiawan_Set_badan.jpg	62049	master	USER	MASTER	199510132022041001	1995-10-13	2022-11-12 18:01:05.381+07	okik.aris@gmail.com	1082104	user	t
113848363266517049246	Moh. Budiono	https://lh3.googleusercontent.com/a/ALm5wu1RQvrRXlkIsP9Qgqbgsr6L16GdjQCvbe63tjaT=s96-c	\N	113848363266517049246	USER	GOOGLE		1970-01-01	2022-11-12 18:08:54.514+07	budiono.kediri@gmail.com	\N	user	t
113640464347712321324	Ferly Rizky Roesadi	https://lh3.googleusercontent.com/a/ALm5wu0j4NyxAUKZfL-Dc7V3N4cS6QaRnVFgwRkL7R4clQ=s96-c	\N	113640464347712321324	USER	GOOGLE		1970-01-01	2022-11-12 19:05:10.035+07	rizky.roesadi@gmail.com	\N	user	t
111630190478569670541	Firdaus Doni Saputra	https://lh3.googleusercontent.com/a/ALm5wu3D9y0-8bteeO0rcKG5O68QnCImIQls0iNKz7NE8w=s96-c	\N	111630190478569670541	USER	GOOGLE		1970-01-01	2022-11-12 19:06:06.212+07	firdaus.donie@gmail.com	\N	user	t
115588986970313388649	metty ningrum	https://lh3.googleusercontent.com/a/ALm5wu0MNN9S7Wv6y_urq6p0h4-VHfZibMt1bIvEamR8=s96-c	\N	115588986970313388649	USER	GOOGLE		1970-01-01	2022-11-12 19:34:09.969+07	mettyningrum90@gmail.com	\N	user	t
108086423398592537008	ISPRIADI	https://lh3.googleusercontent.com/a/ALm5wu0nJPcQPi50XH_h9M-rGYPjPeejU_e9lcB084dzqw=s96-c	\N	108086423398592537008	USER	GOOGLE		1970-01-01	2022-11-12 19:49:20.204+07	izfreeadi@gmail.com	\N	user	t
master|69028	DEDI IRAWAN S.Kom	https://master.bkd.jatimprov.go.id/files_jatimprov/69028-file_foto-20220612-278-UPLOAD1.jpg	69028	master	USER	MASTER	198710182022211010	1987-10-18	2022-11-12 20:11:11.3+07	d3di.ir4w4n@gmail.com	1052410012202	user	t
master|361	Drs. HERU SUDJATMIKO M.Pd	https://master.bkd.jatimprov.go.id/files_jatimprov/361-file_foto-20160525-479-072_HERU_SUDJATMIKO.JPG	361	master	USER	MASTER	196709031993031011	1967-09-03	2023-03-05 22:47:18.143+07	herusudjatmiko67@gmail.com	1110101	user	t
100317925410036661142	Syafrial Rangga	https://lh3.googleusercontent.com/a/ALm5wu0y8biRlvi6Co1BM5ICRngYpCwuMBDO6wPj36dc=s96-c	\N	100317925410036661142	USER	GOOGLE		1970-01-01	2022-11-12 20:11:01.284+07	ralee1916@gmail.com	\N	user	t
master|62325	SYAFRIAL RANGGA PERMANA S.Kep.,Ns	https://master.bkd.jatimprov.go.id/files_jatimprov/62325-file_foto-20220409-863-FOTO_RESMI-fococlipping-standard.jpeg	62325	master	USER	MASTER	198902192022041001	1989-02-19	2022-11-12 20:11:25.97+07	ralee1916@gmail.com	103210126	user	t
master|61901	DIDIK MURSITO S.Pt	https://master.bkd.jatimprov.go.id/files_jatimprov/61901-file_foto-20220929-44-353_DIDIK_MURSITO.jpg	61901	master	USER	MASTER	199312112022041001	1993-12-11	2022-11-12 20:13:17.155+07	didikgak@gmail.com	11704	user	t
107185866885828943201	Diana Rahmawati	https://lh3.googleusercontent.com/a/ALm5wu0AJUo0kg__FbNlC8TC7tiSKb7cgUA1gO3Rvi4cmA=s96-c	\N	107185866885828943201	USER	GOOGLE		1970-01-01	2022-11-12 22:32:06.242+07	dianarahma65@gmail.com	\N	user	t
master|65878	FAISAL AKHMAD YULI ANDIKA S.Pd., Gr.	https://master.bkd.jatimprov.go.id/files_jatimprov/65878-file_foto-20220510-506-Foto_Background_Kuning.jpg	65878	master	USER	MASTER	199307262022211011	1993-07-26	2022-11-12 22:53:03.344+07	faisal.akhmad.fa@gmail.com	10521100112	user	t
pttpk|8603	JANUWARSO BAGUS SAPUTRO, A.Md.Kep	https://bkd.jatimprov.go.id/pttpk/upload_foto/8603januarso_-_Copy.jpg 	8603	pttpk	USER	PTTPK	10218220119930220178616	1993-01-22	2022-11-12 23:35:34.763+07	januwarsobs@gmail.com	1031102	user	t
117163524863752164050	Miftakhul Khasan	https://lh3.googleusercontent.com/a/ALm5wu0k8pMjA8C9N8DzGyXugaFCp1GmRhRdm33C5um7Tg=s96-c	\N	117163524863752164050	USER	GOOGLE		1970-01-01	2022-11-13 00:18:54.903+07	miftakhulkhasan4@gmail.com	\N	user	t
104714747166069198901	haniyah haniyah	https://lh3.googleusercontent.com/a/ALm5wu00lQAtO5S8i3k45q5O7G01-Qx54RrDHBfZevVbZQ=s96-c	\N	104714747166069198901	USER	GOOGLE		1970-01-01	2022-11-13 00:20:07.201+07	haniyahthalib1992@gmail.com	\N	user	t
101055090461324634324	titin sudarwati	https://lh3.googleusercontent.com/a/ALm5wu2fyX-wkdEPxSy39sx6DuawdmGVWt3ykRHfke7vHA=s96-c	\N	101055090461324634324	USER	GOOGLE		1970-01-01	2022-11-13 02:04:46.117+07	titinigd@gmail.com	\N	user	t
master|59524	INDAH NURSERY S.Pd	https://master.bkd.jatimprov.go.id/files_jatimprov/59524-file_foto-20210214-312-setengah_badan.jpeg	59524	master	USER	MASTER	199101162020122012	1991-01-16	2022-11-13 02:39:34.006+07	indahnursey@gmail.com	10542101502	user	t
master|62808	FITRIYAH HANDAYANI S.Pd	https://master.bkd.jatimprov.go.id/files_jatimprov/62808-file_foto-20220519-973-WhatsApp_Image_2022-05-18_at_09.11.26.jpeg	62808	master	USER	MASTER	198411102022212040	1984-11-10	2023-03-02 05:37:32.285+07	zubethandayani@gmail.com	105441004	user	t
master|70273	JENNY NOERHADI WILDANI S.Pd.	https://master.bkd.jatimprov.go.id/files_jatimprov/70273-file_foto-20220622-161-FOTO_SETENGAH_BADAN.jpg	70273	master	USER	MASTER	198706182022211015	1987-06-18	2022-11-13 04:41:05.248+07	jennywildani@yahoo.com	105421016	user	t
master|70153	MUH. ROUF ISMAIL S.Pd.I, Gr	https://master.bkd.jatimprov.go.id/files_jatimprov/70153-file_foto-20220920-64-FOTO_setengah_badan.jpg	70153	master	USER	MASTER	199106182022211015	1991-06-18	2022-11-13 05:46:28.13+07	muh.roufismail@gmail.com	10541102002	user	t
master|62170	STEPHANIE DWI HAPSARI PRABOWO S.Kep., Ns.	https://master.bkd.jatimprov.go.id/files_jatimprov/62170-file_foto-20220929-554-IMG_9334-removebg-preview_(1).jpg	62170	master	USER	MASTER	199802132022042001	1998-02-13	2022-11-13 05:51:19.437+07	stephie.prabowo@gmail.com	103220105	user	t
master|59715	ACHMAD SHOCHEB S. Pd.	https://master.bkd.jatimprov.go.id/files_jatimprov/59715-file_foto-20210215-517-Setengah_Badan.JPG	59715	master	USER	MASTER	199406072020121014	1994-06-07	2022-11-22 20:02:43.158+07	achmadauthor54@gmail.com	10538100902	user	t
master|63670	MOHAMMAD ALI RIDHLO S.Pd	https://master.bkd.jatimprov.go.id/files_jatimprov/63670-file_foto-20220512-473-RIDHLO_SETENGAH_BODY.jpg	63670	master	USER	MASTER	199002142022211012	1990-02-14	2022-11-13 06:54:02.118+07	aliridhlo@gmail.com	1053210011002	user	t
pttpk|11207	LINGGA ASTRIE DEWANTARI, A.Md.AK	https://bkd.jatimprov.go.id/pttpk/upload_foto/IMG-20201011-WA0063.jpg	11207	pttpk	USER	PTTPK	10218240819961020200299	1996-08-24	2022-11-13 07:12:40.046+07	linggaastrie1@gmail.com	1031102	user	t
master|65967	MOHAMMAD SUPRIYADI S.Pd.	https://master.bkd.jatimprov.go.id/files_jatimprov/65967-file_foto-20220518-612-IMG_9136_11zon.jpg	65967	master	USER	MASTER	198002282022211008	1980-02-28	2022-11-16 12:08:26.339+07	4nd1zh4f.80@gmail.com	10523100121	user	f
master|71047	MOHAMMAD YUDITTIA YASIN S.T., S.Pd.	https://master.bkd.jatimprov.go.id/files_jatimprov/71047-file_foto-20220909-868-4x6_resize_under_200kb.jpg	71047	master	USER	MASTER	198210302022211015	1982-10-30	2022-11-13 08:20:32.877+07	supixtop@gmail.com	1053110011402	user	f
master|66532	PIPIT PUSPITARINI S.Pd., Gr	https://master.bkd.jatimprov.go.id/files_jatimprov/66532-file_foto-20220512-52-WhatsApp_Image_2022-05-12_at_09.18.41_(1).jpeg	66532	master	USER	MASTER	198903132022212022	1989-03-13	2022-11-13 12:53:50.77+07	pipit.puspitarini55@gmail.com	105401016	user	t
master|67655	ROHMAN FAKEH S.Pt.	https://master.bkd.jatimprov.go.id/files_jatimprov/67655-file_foto-20220524-218-FOTO_SETENGAH.jpeg	67655	master	USER	MASTER	198408092022211016	1984-08-09	2022-11-13 11:26:08.728+07	rohmanfakeh.rf@gmail.com	10528100121	user	t
master|61377	AYU FIRSTIA LOVIANA Amd.Keb	https://master.bkd.jatimprov.go.id/files_jatimprov/61377-file_foto-20220507-704-Fix_setengah_badan.JPG	61377	master	USER	MASTER	199609212022042001	1996-09-21	2023-02-22 08:00:20.751+07	ayufirstlov@gmail.com	1031702	user	t
111850381925090480094	arimita savithri	https://lh3.googleusercontent.com/a/ALm5wu3TrkhUOwSt_8-BeFXLjhP2q8G6ZP2cy2yRMulE=s96-c	\N	111850381925090480094	USER	GOOGLE		1970-01-01	2022-11-14 16:03:55.517+07	arimita.s@gmail.com	\N	user	t
108420766870636421264	yulian nur Hanifa	https://lh3.googleusercontent.com/a/ALm5wu1csMd4uCNdk5ZVJMB9mzwRx6OSJbnK-oe1dNpD=s96-c	\N	108420766870636421264	USER	GOOGLE		1970-01-01	2022-11-13 13:25:14.1+07	hanifayul@gmail.com	\N	user	t
111571035429158237012	Ananda Syahriya	https://lh3.googleusercontent.com/a/ALm5wu3HYlXF3MeavDmGKDqlyGT8Emlf9GlUQ0USJLOAgA=s96-c	\N	111571035429158237012	USER	GOOGLE		1970-01-01	2022-11-13 13:28:41.058+07	anandasyahriya.as@gmail.com	\N	user	t
master|62409	FEBRIA KARINA SARI	https://master.bkd.jatimprov.go.id/files_jatimprov/62409-file_foto-20220410-58-4_x_6_(1).jpg	62409	master	USER	MASTER	198902202022042001	1989-02-20	2022-11-13 13:29:39.443+07	kurapikadotchan@gmail.com	103230223	user	t
pttpk|9805	RONY FATINA SARANI	https://bkd.jatimprov.go.id/pttpk/upload_foto/9805dddd_1.jpg 	9805	pttpk	USER	PTTPK	113080719760420189763	1976-07-08	2022-11-13 16:07:50.606+07	email9@gmail.com	1062202	user	t
109003524841867458743	faida achmad	https://lh3.googleusercontent.com/a/ALm5wu13FzwfKhRzH_Dj8DExPDaJn4D6ymTl8xwxxwEUDCs=s96-c	\N	109003524841867458743	USER	GOOGLE		1970-01-01	2022-11-13 18:45:25.988+07	faida.achmad@gmail.com	\N	user	t
master|62214	SULISTIANING HADI APRILIYA A.Md.Kep	https://master.bkd.jatimprov.go.id/files_jatimprov/62214-file_foto-20220409-807-photo1649420666.jpeg	62214	master	USER	MASTER	198904202022042001	1989-04-20	2022-11-13 19:15:01.101+07	nic2004thy@gmail.com	103220107	user	t
master|66953	ELLYSA YUNIAR EKA WARDHANI S.Pd., Gr	https://master.bkd.jatimprov.go.id/files_jatimprov/66953-file_foto-20220511-458-FOTO_BG_KUNING.jpg	66953	master	USER	MASTER	198806152022212018	1988-06-15	2022-11-13 20:03:53.468+07	ellysa.dhani@gmail.com	1052710010702	user	t
110942857663591056064	Miftakhul Khasan	https://lh3.googleusercontent.com/a/ALm5wu23nlQBAdHdaluV1d5jnd3HNQBT446SuOG_i-rl=s96-c	\N	110942857663591056064	USER	GOOGLE		1970-01-01	2022-11-13 20:07:23.942+07	miftakhulkhasan55@guru.sma.belajar.id	\N	user	t
117465276252775609246	Diana Puspa Rini	https://lh3.googleusercontent.com/a/ALm5wu3xcdVmW68MEq_JIZA1GiRQyJEVsVw8TyN20wUL=s96-c	\N	117465276252775609246	USER	GOOGLE		1970-01-01	2022-11-13 22:17:03.892+07	dianapuspandu@gmail.com	\N	user	t
110519418246527428859	Ainun Akhsin	https://lh3.googleusercontent.com/a/ALm5wu1IKGYtC9WTwaMtWD35JJ6mQRd0iIbpCJhh7O3qww=s96-c	\N	110519418246527428859	USER	GOOGLE		1970-01-01	2022-11-13 22:16:19.134+07	ainunakhsin75@guru.sma.belajar.id	\N	user	f
master|68574	MUHAMAD KURNIAWAN S.T.,Gr	https://master.bkd.jatimprov.go.id/files_jatimprov/68574-file_foto-20220614-187-setengah_badan.jpg	68574	master	USER	MASTER	197603132022211007	1976-03-13	2022-11-14 04:59:06.295+07	waone.kurniawan1976@gmail.com	1052310021502	user	t
118033167337501693810	Widy Harsono	https://lh3.googleusercontent.com/a/ALm5wu3044ivgyAir-WBN7cy7TjQxR9gQAVJLA53Mm_C=s96-c	\N	118033167337501693810	USER	GOOGLE		1970-01-01	2022-11-14 08:37:00.031+07	widykrtprandon@gmail.com	\N	user	t
pttpk|9854	GALOH UTOMO, ST	https://bkd.jatimprov.go.id/pttpk/upload_foto/9854019_galoh_utomo-min.JPG 	9854	pttpk	USER	PTTPK	113041019940420189810	1994-10-04	2022-11-14 08:54:48.001+07	galohutomo@gmail.com	1061402	user	f
master|70051	PONIRIN S.Kom., Gr.	https://master.bkd.jatimprov.go.id/files_jatimprov/70051-file_foto-20220614-827-1655191860866_(1).jpg	70051	master	USER	MASTER	198911162022211015	1989-11-16	2022-11-14 09:34:08.433+07	poniasj@gmail.com	105401005	user	t
109111016583523221724	indhira ismaya	https://lh3.googleusercontent.com/a/ALm5wu39gw5z2mMYBvC9W2x77sBBX9buii-i9HEwyfU=s96-c	\N	109111016583523221724	USER	GOOGLE		1970-01-01	2022-11-14 12:54:25.506+07	indhira.ismaya.office@gmail.com	\N	user	t
107225726392889395033	ros wandansari	https://lh3.googleusercontent.com/a/ALm5wu0sOLdnntbU6LkOoQurEvTsrmUiuqHjHQb2fOSI=s96-c	\N	107225726392889395033	USER	GOOGLE		1970-01-01	2022-11-14 17:05:39.844+07	ros.wandansari86@gmail.com	\N	user	f
109634782999829794222	Hanik Susanti	https://lh3.googleusercontent.com/a/ALm5wu1IRrBlEUeLG1otRev5x6e7jE5kFj2gX4XVRbEb=s96-c	\N	109634782999829794222	USER	GOOGLE		1970-01-01	2022-11-14 19:19:24.738+07	haniksusanti59@gmail.com	\N	user	t
master|61670	YUSUFI A. Md. Keb	https://master.bkd.jatimprov.go.id/files_jatimprov/61670-file_foto-20220410-959-yusufi_4x6.jpg	61670	master	USER	MASTER	199101012022042001	1991-01-01	2022-11-14 19:24:27.99+07	jieyusufi@gmail.com	103080202	user	t
116423286111481434115	Ika Agustin Rahmawati	https://lh3.googleusercontent.com/a/ALm5wu0OcATUjNtsdbZh5TzxjMDoCZXWxnxJ6YOjv-9drA=s96-c	\N	116423286111481434115	USER	GOOGLE		1970-01-01	2022-11-14 21:11:06.948+07	ikarahmawati571@gmail.com	\N	user	t
101781969877884729924	Andini Ismelawati	https://lh3.googleusercontent.com/a/ALm5wu3yc_IYzRXE1ZEsJiDALbNJW6h6fTobum7tMLBb=s96-c	\N	101781969877884729924	USER	GOOGLE		1970-01-01	2022-11-14 21:49:12.269+07	ismelawatiandini@gmail.com	\N	user	t
116327472568778270097	Dwi Indah wulandari	https://lh3.googleusercontent.com/a/ALm5wu2giW7KCWdaHpdEBdshDr5welAxG--kTZJ6C5ds=s96-c	\N	116327472568778270097	USER	GOOGLE		1970-01-01	2022-11-15 06:07:35.545+07	dwiindahwulandari12@gmail.com	\N	user	t
master|4209	SUPRIONO  S.M	https://master.bkd.jatimprov.go.id/files_jatimprov/4209-file_foto-20200910-604-SUPRIONO-removebg-preview-removebg-preview.jpg	4209	master	USER	MASTER	197608232008011017	1976-08-23	2022-11-15 07:15:17.217+07	ono23876@gmail.com	10541101601	user	t
105106952708336013003	Erlyn Yulia	https://lh3.googleusercontent.com/a/ALm5wu1Yemg1XsNczpGUGLHNkXie9rO-E5N8qp3nwKR3=s96-c	\N	105106952708336013003	USER	GOOGLE		1970-01-01	2022-11-15 09:26:58.227+07	erlynyulia13@guru.sma.belajar.id	\N	user	t
107267828438489128090	Fitriah	https://lh3.googleusercontent.com/a/ALm5wu3Uh9cxdzNnBo0TZK_uKy9nn7DYvOckGluqEUKkCQ=s96-c	\N	107267828438489128090	USER	GOOGLE		1970-01-01	2022-11-15 11:22:40.578+07	fitriaah19@gmail.com	\N	user	t
pttpk|11532	FITRIA HANDAYANI, S.E,. M.M.	https://bkd.jatimprov.go.id/pttpk/upload_foto/115324_x_6_Fitria_Handayani-removebg-preview.jpg 	11532	pttpk	USER	PTTPK	108010519910120210969	1991-05-01	2022-11-15 19:31:54.85+07	beetriaputri@gmail.com	1081001	user	t
111143888208503069938	Maria Ulfa	https://lh3.googleusercontent.com/a/ALm5wu0ngRwQDsQNhm8i9io3AF1_28DNj6EQPR_JbUK9=s96-c	\N	111143888208503069938	USER	GOOGLE		1970-01-01	2022-11-16 04:27:54.791+07	mariaulfa65@guru.sma.belajar.id	\N	user	t
master|4618	BANU RESTU SETIAWAN S.E.	https://master.bkd.jatimprov.go.id/files_jatimprov/4618-file_foto-20210917-536-foto_kecil.jpg	4618	master	USER	MASTER	197805032007011012	1978-05-03	2022-11-16 06:54:06.461+07	banusetiawan99@gmail.com	1052610030401	user	f
master|65234	BAYU PEBRIANTO WICAKSONO S.Kom	https://master.bkd.jatimprov.go.id/files_jatimprov/65234-file_foto-20220528-450-foto_pdh_putih.jpg	65234	master	USER	MASTER	199102062022211012	1991-02-06	2022-11-16 11:16:51.822+07	bayu.pebrianto.wicaksono@gmail.com	1052910021102	user	t
107986382363242833228	Enin Sulistiyowati, S.pd	https://lh3.googleusercontent.com/a/ALm5wu0PPlBaDt_9gc0FD_w6zAQd1An6en_PmGawzS4l=s96-c	\N	107986382363242833228	USER	GOOGLE		1970-01-01	2022-11-16 12:58:04.783+07	eninspd10@guru.smk.belajar.id	\N	user	t
103104545772913791516	A M	https://lh3.googleusercontent.com/a/ALm5wu2XB_Atb2jaUTM37-RqHab56eblLVKdC2rlfNGmxA=s96-c	\N	103104545772913791516	USER	GOOGLE		1970-01-01	2022-11-16 14:17:03.264+07	alimmustain1@gmail.com	\N	user	t
108871085617235752295	Emerensia Rhani	https://lh3.googleusercontent.com/a/ALm5wu02qFV12iKBvZE8O_yMCzxXJoumxauspKjEqu14=s96-c	\N	108871085617235752295	USER	GOOGLE		1970-01-01	2022-11-16 14:30:42.677+07	emerensia.rhani2428@gmail.com	\N	user	t
111944623995616797929	dj maylan	https://lh3.googleusercontent.com/a/ALm5wu2UzXJMxCaMhnCeMJ9MBLKuCfQzxgXvuzJsF4qn=s96-c	\N	111944623995616797929	USER	GOOGLE		1970-01-01	2022-11-17 10:40:53.896+07	djmaylan6@gmail.com	\N	user	t
master|19749	ENDANG SUPARIJATUN S.Pd.	https://master.bkd.jatimprov.go.id/files_jatimprov/19749-file_foto-20190725-712-FOTO_SETENGAH_BADAN.jpg	19749	master	USER	MASTER	197110072006042014	1971-10-07	2022-11-17 18:47:53.205+07	endangsuparijatun@ymail.com	1052610012102	user	t
113250883422360906597	Chutman Efendi	https://lh3.googleusercontent.com/a/ALm5wu035ND9LnkiXXdmVAwr1ltMK4M4M4v7RHIHKL_oPQ=s96-c	\N	113250883422360906597	USER	GOOGLE		1970-01-01	2022-11-17 19:17:10.515+07	efendichutman99@gmail.com	\N	user	t
109446770364328484192	Rangga Andi Risokta	https://lh3.googleusercontent.com/a/ALm5wu2KiJ2ci9eYuS3VwPgVk2Z2bbFL0FrPZeDFipuP=s96-c	\N	109446770364328484192	USER	GOOGLE		1970-01-01	2022-11-18 10:57:56.434+07	ranggarisokta40@guru.smk.belajar.id	\N	user	f
master|64940	RANGGA ANDI RISOKTA S.Pd., Gr.	https://master.bkd.jatimprov.go.id/files_jatimprov/64940-file_foto-20220510-16-FOTO_SEPARUH_BADAN_RANGGA-kuning.jpg	64940	master	USER	MASTER	199110042022211010	1991-10-04	2022-11-18 10:59:08.201+07	risokta@gmail.com 	10532100214	user	t
master|4219	MARIA MARGARETA	https://master.bkd.jatimprov.go.id/files_jatimprov/4219-file_foto-20220518-189-foto_maria-removebg-preview.jpeg	4219	master	USER	MASTER	197907212007012010	1979-07-21	2022-11-18 15:07:52.307+07	maria.skansa@gmail.com	1052610031701	user	t
104278550572022079972	Ika Agustin Rahmawati, S.pd	https://lh3.googleusercontent.com/a/ALm5wu2ykVBd6VaNpSzjINwvTAZzh_F7zCDhJbBa_oIb=s96-c	\N	104278550572022079972	USER	GOOGLE		1970-01-01	2022-11-21 07:20:41.648+07	ikaspd58@guru.smk.belajar.id	\N	user	t
109524029811118075633	Iva Nurchorisa	https://lh3.googleusercontent.com/a/ALm5wu1gQlB3wOcgqumE-3QOVrNCP2aSpAXSc9dki8rD=s96-c	\N	109524029811118075633	USER	GOOGLE		1970-01-01	2022-11-21 09:56:17.798+07	ivanurchorisa88@guru.sma.belajar.id	\N	user	t
112715779598747600599	Dewi NK	https://lh3.googleusercontent.com/a/ALm5wu0qg-2DTrvxefIjpHQCoWWN6V__yi2CTindSu2EFQ=s96-c	\N	112715779598747600599	USER	GOOGLE		1970-01-01	2022-11-21 12:43:38.328+07	dewink125@gmail.com	\N	user	t
101567485873614780867	candra gumilang	https://lh3.googleusercontent.com/a/ALm5wu0fkf1MW33VD9uNePsEN6ZfBnYASTphrAE0Ahkk=s96-c	\N	101567485873614780867	USER	GOOGLE		1970-01-01	2022-11-21 13:15:19.614+07	candragumilan6@gmail.com	\N	user	t
106669961424323005623	SMKN 8 JEMBER _ Ali Muhtar	https://lh3.googleusercontent.com/a/ALm5wu2uGeMP8-lXSBkU7d1x4zEUzNHsYNhOuyMvX18h=s96-c	\N	106669961424323005623	USER	GOOGLE		1970-01-01	2022-11-27 16:10:29.401+07	alimuhtarspd@gmail.com	\N	user	t
master|71330	NANIK YUNITA S.Pd	https://master.bkd.jatimprov.go.id/files_jatimprov/71330-file_foto-20220620-306-FT_setengah_badan.jpg	71330	master	USER	MASTER	197707102022212020	1977-07-10	2022-11-28 18:28:40.565+07	nanikyunita10071977@gmail.com	1053210010202	user	t
116123925492025249261	rasmu hana	https://lh3.googleusercontent.com/a/AEdFTp7uibBbM3CFmnVDGqUsdsLOi9AsgGbuUV7xf0S-=s96-c	\N	116123925492025249261	USER	GOOGLE		1970-01-01	2022-12-06 07:30:26.369+07	rasmumuna@gmail.com	\N	user	t
109043814877684733382	luluk nurjanah	https://lh3.googleusercontent.com/a/AEdFTp5A4ZHzM0931Yvn66Fsf-iDWDC7XLN6XV5Kn_V7gZk=s96-c	\N	109043814877684733382	USER	GOOGLE		1970-01-01	2022-12-08 19:15:11.052+07	luluknurjanah2015@gmail.com	\N	user	f
master|6181	MUHAMMAD HIDAYAT RAHMAN S.Pd	https://master.bkd.jatimprov.go.id/files_jatimprov/6181-file_foto-20160511-592-IMG_2009.JPG	6181	master	USER	MASTER	196812161990111001	1968-12-16	2022-12-08 19:17:27.592+07	muhammadhidayatrahman@gmail.com	1052810020202	user	f
116283402201057484487	Rani Pramudya Wardhani	https://lh3.googleusercontent.com/a/AEdFTp5_EJ1CPgdwGBnd1Dck5XTTmQJQh86_1-O0pdnQ=s96-c	\N	116283402201057484487	USER	GOOGLE		1970-01-01	2022-12-10 00:04:07.551+07	raniwardhani27@guru.sma.belajar.id	\N	user	t
108063347615393395047	Novie Asriati Ayu Riski	https://lh3.googleusercontent.com/a/AGNmyxaQlfLRI0EtE9e3lJJudt5Mdnk0GbgwabYnN2Zs=s96-c	\N	108063347615393395047	USER	GOOGLE		1970-01-01	2023-03-24 12:02:24.179+07	risnovie@gmail.com	\N	user	t
master|46466	PRISTI WAHYUDI	https://master.bkd.jatimprov.go.id/files_jatimprov/46466-file_foto-20220109-68-setengah_badan.jpg	46466	master	USER	MASTER	197612212008011003	1976-12-21	2023-02-21 18:55:27.36+07	wahyudipristi@gmail.com	12605	user	t
master|46893	IWAN HARIYANTO	https://master.bkd.jatimprov.go.id/files_jatimprov/46893-file_foto-20220308-247-018_Iwan_Hariyanto__189_k.jpg	46893	master	USER	MASTER	198203172010011007	1982-03-17	2023-02-21 18:59:12.443+07	iwanhyt7@gmail.com	1370101	user	t
master|565	SUPENO ST	https://master.bkd.jatimprov.go.id/files_jatimprov/565-file_foto-20170127-335-043_SUPENO_19710523_199310_1_001_(2).JPG	565	master	USER	MASTER	197105231993101001	1971-05-23	2023-02-21 19:33:41.125+07	supeno.prambon@gmail.com	1130503	user	t
master|34233	ATIEK DIANA SKM	https://master.bkd.jatimprov.go.id/files_jatimprov/34233-file_foto-20201211-162-foto_setengah_badan_atiek.jpeg	34233	master	USER	MASTER	197112082000032004	1971-12-08	2023-02-21 19:42:43.825+07	atiek.diana@gmail.com	10323030102	user	t
master|60513	BOCUT AMARINA MALAHAYATI S.IP	https://master.bkd.jatimprov.go.id/files_jatimprov/60513-file_foto-20220824-269-BOCUT_AMARINA_MALAHAYATI_crop.JPG	60513	master	USER	MASTER	199503252017082002	1995-03-25	2023-02-21 20:14:18.977+07	bocutamarina@yahoo.com	1360101	user	t
115066139582912607057	Mazizun Aliyah	https://lh3.googleusercontent.com/a/AEdFTp5WkXUUVx6ZY_vuBspKp3s-fQGH5-UhA_Ev3E36=s96-c	\N	115066139582912607057	USER	GOOGLE		1970-01-01	2022-12-13 11:55:05.06+07	mazizunaliyah67@guru.sma.belajar.id	\N	user	t
114042937337183449303	eko prasetyo	https://lh3.googleusercontent.com/a/AEdFTp4kufxbFoTgAKdWa9l6GAfsDmGtojsJUXBGqLfy6g=s96-c	\N	114042937337183449303	USER	GOOGLE		1970-01-01	2022-12-13 14:07:24.545+07	ekobudip86@gmail.com	\N	user	t
master|56761	DIKI ANGGORO PUTRA S.Kom.	https://master.bkd.jatimprov.go.id/files_jatimprov/56761-file_foto-20200807-633-Berdiri_Atribut_orange_cut_resize.jpg	56761	master	USER	MASTER	198909202019031008	1989-09-20	2023-02-15 15:41:52.002+07	dikidp13@gmail.com	1290101	user	t
106860612989903672083	iwan hyt	https://lh3.googleusercontent.com/a/AEdFTp58jIpqeIUyA7vdNZXtabOZ1RWJePdJvBVUR3z03Sg=s96-c	\N	106860612989903672083	USER	GOOGLE		1970-01-01	2023-02-15 20:04:13.332+07	iwanhyt7@gmail.com	\N	user	t
102987175005428194985	Haris Fuady	https://lh3.googleusercontent.com/a/AEdFTp6prt4KGMQsKkuOIQv6Qm17a1nPPbPZvLWiVgtD=s96-c	\N	102987175005428194985	USER	GOOGLE		1970-01-01	2023-02-15 22:21:05.89+07	risdzy@gmail.com	\N	user	t
master|39400	ACHMAD FARID S.Sos.	https://master.bkd.jatimprov.go.id/files_jatimprov/39400-file_foto-20200831-280-farid.jpg	39400	master	USER	MASTER	196710131988031001	1967-10-13	2023-02-19 22:06:57.283+07	achmadfarid1013@gmail.com	1510101	user	t
116884065911676631095	fajar septiyan	https://lh3.googleusercontent.com/a/AGNmyxbU3N5P9gylHgAf8WA2LJ_BheNA7RmIHkDlOQ6L=s96-c	\N	116884065911676631095	USER	GOOGLE		1970-01-01	2023-03-17 12:08:41.837+07	fajarseptiyan2021@gmail.com	\N	user	t
108416657661466806916	Ucik Sugiono	https://lh3.googleusercontent.com/a/AGNmyxavAp1SWPrv626c_6MQ0azvelyk7QnToFThBEpDJg=s96-c	\N	108416657661466806916	USER	GOOGLE		1970-01-01	2023-02-22 06:17:33.176+07	gioucik@gmail.com	\N	user	t
107977598636691987880	oksheila rivera	https://lh3.googleusercontent.com/a/AGNmyxaX2_74aSG8GCz30JFSBSDyn2tLnJBKHiZQ5PyG=s96-c	\N	107977598636691987880	USER	GOOGLE		1970-01-01	2023-02-22 06:20:31.368+07	riveroxcel@gmail.com	\N	user	t
master|61101	ARUM AMALIA MASYITAH A.Md. Akun.	https://master.bkd.jatimprov.go.id/files_jatimprov/61101-file_foto-20220522-172-Arum_-_3x4_(1).jpg	61101	master	USER	MASTER	199803102022042001	1998-03-10	2023-02-22 06:21:15.022+07	arumasitha@gmail.com	12241	user	t
master|61538	IKA KRISNA PRATIWI AMd. Kep	https://master.bkd.jatimprov.go.id/files_jatimprov/61538-file_foto-20221215-709-IMG-20221215-WA0006.jpg	61538	master	USER	MASTER	199310022022042001	1993-10-02	2023-02-22 06:26:55.63+07	ikakrisnapratiwi7@gmail.com	103120202	user	t
master|62134	dr. MUHAMMAD IKHTIAR ZAKI AL RAZZAK	https://master.bkd.jatimprov.go.id/files_jatimprov/62134-file_foto-20220714-75-008_M_Ikhtiar_Zaki_Al_D.jpg	62134	master	USER	MASTER	199407212022041001	1994-07-21	2023-02-22 06:27:14.742+07	muhammad.ikhtiar.zaki94@gmail.com	1032501010201	user	t
master|61417	BOBBY VIRGO CANDRA WICAKSONO A.Md.AK	https://master.bkd.jatimprov.go.id/files_jatimprov/61417-file_foto-20221220-42-BOBBY_VIRGO_C.W..jpeg	61417	master	USER	MASTER	199309042022041001	1993-09-04	2023-02-22 06:30:20.021+07	bobbyvirgo1993@gmail.com	1031702	user	f
master|61528	ERRI KURNIA UASTRI ANDANI A.Md.Ft.	https://master.bkd.jatimprov.go.id/files_jatimprov/61528-file_foto-20221130-600-80fe79.jpg	61528	master	USER	MASTER	199408272022042002	1994-08-27	2023-02-22 06:55:34.245+07	erri.kurnia@gmail.com	103120201	user	t
master|61605	YETI ARDELLA A.Md.Farm.	https://master.bkd.jatimprov.go.id/files_jatimprov/61605-file_foto-20221211-126-Della2-1mb_11zon.jpg	61605	master	USER	MASTER	199507242022042001	1995-07-24	2023-02-22 07:04:27.855+07	Yettyardella@gmail.com	1030902	user	t
102944886835911096997	rukmini astutik	https://lh3.googleusercontent.com/a/AGNmyxbPIGjOkH5GPTxMkVm2cOGlhf94U_sm4cGSn88Pgg=s96-c	\N	102944886835911096997	USER	GOOGLE		1970-01-01	2023-02-22 07:05:37.136+07	rukminiastutik88@gmail.com	\N	user	t
master|61760	RIFA UMAMI A.Md	https://master.bkd.jatimprov.go.id/files_jatimprov/61760-file_foto-20220520-482-DSC_Rifa_Umami.jpg	61760	master	USER	MASTER	199303162022042001	1993-03-16	2023-02-22 07:13:38.074+07	ryfaumami@gmail.com	1061103	user	t
master|61474	APRILIA DWI SUSANTI A.Md.Keb.	https://master.bkd.jatimprov.go.id/files_jatimprov/61474-file_foto-20221006-202-FOTO_KHAKI.jpeg	61474	master	USER	MASTER	198704182022042001	1987-04-18	2023-02-24 16:18:31.894+07	santi2011.s2@gmail.com	1031102	user	t
master|61725	AHMAD FAIZIN S.T.	https://master.bkd.jatimprov.go.id/files_jatimprov/61725-file_foto-20220614-887-SDA_(15)_AHMAD_FAIZIN.jpg	61725	master	USER	MASTER	199403142022041001	1994-03-14	2023-02-22 08:06:04.524+07	ahmadfaizin.sda@gmail.com	1131602	user	t
master|61406	SUDIONO A.Md.Kep	https://master.bkd.jatimprov.go.id/files_jatimprov/61406-file_foto-20220522-467-img1653205674000.jpg	61406	master	USER	MASTER	198706032022041001	1987-06-03	2023-02-22 08:11:46.558+07	rayyanputradion87@gmail.com	1031702	user	t
master|61478	LUTHFIANA MAYANG ANDRAINI A.Md.AK.	https://master.bkd.jatimprov.go.id/files_jatimprov/61478-file_foto-20221128-277-WhatsApp_Image_2022-11-17_at_14.10.01.jpeg	61478	master	USER	MASTER	199207022022042001	1992-07-02	2023-02-27 08:15:36.632+07	mayangandraini@gmail.com	1031103	user	t
master|61367	RIZKY INTAN TRISNA DEWI S.KM.	https://master.bkd.jatimprov.go.id/files_jatimprov/61367-file_foto-20221017-249-Picsart_22-04-24_16-06-37-397.jpg	61367	master	USER	MASTER	199705132022042002	1997-05-13	2023-02-22 08:30:34.774+07	rizky.intan97@gmail.com	1031703	user	f
master|61321	RIZAL ADITYA NUGROHO S.Kom.	https://master.bkd.jatimprov.go.id/files_jatimprov/61321-file_foto-20220509-615-WhatsApp_Image_2022-05-09_at_09.30.10_(1).jpeg	61321	master	USER	MASTER	199807052022041001	1998-07-05	2023-02-22 08:42:57.548+07	rizaladityanugroho@gmail.com	1180101	user	t
116365318290887341648	Rendri Dewi	https://lh3.googleusercontent.com/a/AGNmyxZc0ZAkWZ9EP7sl91uyu4z59skxJwnFLIUM_hwM=s96-c	\N	116365318290887341648	USER	GOOGLE		1970-01-01	2023-02-24 06:47:00.995+07	rndrdewi@gmail.com	\N	user	t
pttpk|2462	DWI HARSIWI, S.Psi	https://bkd.jatimprov.go.id/pttpk/upload_foto/24623x4_SIWI.jpg 	2462	pttpk	USER	PTTPK	123031119880420142462	1988-11-03	2023-02-22 09:54:42.512+07	harsiwidwi@gmail.com	1190101	user	f
master|4192	MARWATI	https://master.bkd.jatimprov.go.id/files_jatimprov/4192-file_foto-20160510-498-197805142010012002-min.jpg	4192	master	USER	MASTER	197805142010012002	1978-05-14	2023-02-22 10:57:57.707+07	marwati1202.mw@gmail.com	1190101	user	t
master|56544	ZHULFI BAJRA WIKJATMIKO S.Kom.	https://master.bkd.jatimprov.go.id/files_jatimprov/56544-file_foto-20190720-88-DSC_0463.JPG	56544	master	USER	MASTER	199111072019031005	1991-11-07	2023-03-26 11:10:02.116+07	wikjatmiko@gmail.com	12302	admin	t
117168871094768994773	Diwa Kara	https://lh3.googleusercontent.com/a/AGNmyxZT-zC9SKvJAcMbI016TVuAkcDCRRHrU__QTW-0=s96-c	\N	117168871094768994773	USER	GOOGLE		1970-01-01	2023-02-22 23:35:20.642+07	diwangkara907@gmail.com	\N	user	t
106899534610390547480	Heru Sudjatmiko	https://lh3.googleusercontent.com/a/AGNmyxbgUH1GZC3aGjzec-C6kzMfahTn_4krYyYb8gaE6g=s96-c	\N	106899534610390547480	USER	GOOGLE		1970-01-01	2023-03-06 22:02:49.883+07	herusudjatmiko67@gmail.com	\N	user	t
107951032401848979939	Arvy Rohi	https://lh3.googleusercontent.com/a/AGNmyxbeiOlY8vXHvSaLgtrYJ6kb_EuuHZ2Qjr9VFTx_Rw=s96-c	\N	107951032401848979939	USER	GOOGLE		1970-01-01	2023-02-23 04:07:27.881+07	arvyiedararohi@gmail.com	\N	user	t
master|61809	HENDRA BUDI SETYAWAN A.Md.	https://master.bkd.jatimprov.go.id/files_jatimprov/61809-file_foto-20220615-111-IMG_20220615_134343.jpg	61809	master	USER	MASTER	199612022022041002	1996-12-02	2023-02-23 04:39:07.632+07	hendrabudi705@gmail.com	1201203	user	t
master|61524	APRILLIA PUTRI SARTIKA S.Kep., Ns.	https://master.bkd.jatimprov.go.id/files_jatimprov/61524-file_foto-20221128-106-WhatsApp_Image_2022-11-28_at_09.06.10.jpeg	61524	master	USER	MASTER	199404302022042001	1994-04-30	2023-03-18 08:19:34.789+07	MEJIKUHIBINIUCK@GMAIL.COM	103120202	user	t
master|39908	LILIK DWI LESTARI	https://master.bkd.jatimprov.go.id/files_jatimprov/39908-file_foto-20210303-767-24._LILIK_DWI_LESTARI_1.jpg	39908	master	USER	MASTER	197611292010012002	1976-11-29	2023-02-27 13:02:30.23+07	lilikdwilestari02@gmail.com	1040701	user	f
master|61149	NURLAELA SARI A.Md	https://master.bkd.jatimprov.go.id/files_jatimprov/61149-file_foto-20220407-931-pas_foto_orange.jpeg	61149	master	USER	MASTER	198703042022042001	1987-03-04	2023-02-23 05:45:32.71+07	ela1987.ns@gmail.com	12701	user	t
109387812623431543706	Ryan Indra Herdiyansyah	https://lh3.googleusercontent.com/a/AGNmyxbiFaY3meCbNhhOR4M61wuLy_Sq5tB3etz8ri3J=s96-c	\N	109387812623431543706	USER	GOOGLE		1970-01-01	2023-02-23 07:31:27.075+07	ryanindra370@gmail.com	\N	user	t
104444158678978385689	Novan Ari	https://lh3.googleusercontent.com/a/AGNmyxYttQB0OPXl8tgOQQVrd5wBVi5NeblV0QxKD47e=s96-c	\N	104444158678978385689	USER	GOOGLE		1970-01-01	2023-02-27 16:27:43.901+07	novanari6@gmail.com	\N	user	t
master|55948	ZULIATI S.Kom, MM	https://master.bkd.jatimprov.go.id/files_jatimprov/55948-file_foto-20220722-503-IMG-20220722-WA0024.jpg	55948	master	USER	MASTER	197706162008012022	1977-06-16	2023-02-28 09:30:13.363+07	zulieatie@gmail.com	1053301	user	t
master|56552	AKHMAD FATONI BUDIRAHARJO S. Psi., M.A.	https://master.bkd.jatimprov.go.id/files_jatimprov/56552-file_foto-20200715-234-fat_set.jpg	56552	master	USER	MASTER	198504122019031003	1985-04-12	2023-03-03 14:32:54.039+07	fatoni.afb@gmail.com	12306	admin	f
105622302617721260523	Muhaimin S.E	https://lh3.googleusercontent.com/a/AGNmyxbknTXrm3zrNvI3rC9oKFH2hZ6A-9pPbZKywbNQ=s96-c	\N	105622302617721260523	USER	GOOGLE		1970-01-01	2023-03-15 09:18:19.076+07	muhaimin@sman1batu.sch.id	\N	user	f
master|18225	ADI SUTITO M.Pd.	https://master.bkd.jatimprov.go.id/files_jatimprov/18225-file_foto-20220421-769-TITO_DRILL.jpeg	18225	master	USER	MASTER	197004041994031010	1970-04-04	2023-03-02 16:44:06.524+07	masadisutito@gmail.com	1052610031902	user	t
master|95	YUDI JIHWINDRIYO S.STP., M.Sos	https://master.bkd.jatimprov.go.id/files_jatimprov/95-file_foto-20220316-124-yudi_set.jpg	95	master	USER	MASTER	199004222010101002	1990-04-22	2023-03-15 09:17:53.423+07	jihwindriyo@gmail.com	12302	admin	t
118028638558620614547	Dimas Ridho	https://lh3.googleusercontent.com/a/AGNmyxa3S9cNbEBZJDvdSsO8DCXjNsDqXx0_xgaeR8Yt=s96-c	\N	118028638558620614547	USER	GOOGLE		1970-01-01	2023-02-28 16:05:43.99+07	dimasridhoazizb@gmail.com	\N	user	f
pttpk|11678	DIMAS RIDHO AZIZ BUDITOMO, SM	https://bkd.jatimprov.go.id/pttpk/upload_foto/164_Dimas_Ridho_Aziz_B.jpg	11678	pttpk	USER	PTTPK	10217011219960120219980	1996-12-01	2023-03-21 10:13:33.617+07	dimasridhoazizb@gmail.com	103120101	user	t
113167592061797186506	suryaningtyas puspita	https://lh3.googleusercontent.com/a/AGNmyxYXEiiSZZvMp1Z3mXfac7SiHaCzkkSqeJZVg-g=s96-c	\N	113167592061797186506	USER	GOOGLE		1970-01-01	2023-03-02 11:36:40.071+07	suryaningtyas.puspita@gmail.com	\N	user	t
pttpk|9590	ARUM PUTRI ISWANTI, SH	https://bkd.jatimprov.go.id/pttpk/upload_foto/9590Foto_Seragam_Ku-removebg-preview_(3).jpeg	9590	pttpk	USER	PTTPK	110220819930120189566	1993-08-22	2023-03-01 20:20:32.534+07	arum.putri36@gmail.com	1151601	user	t
105415389371294818903	dwi muklis	https://lh3.googleusercontent.com/a/AGNmyxYfKOa-8wngOcu49eeQ0CFRRS4zgXqw1S9TYaWaEQ=s96-c	\N	105415389371294818903	USER	GOOGLE		1970-01-01	2023-03-04 23:40:42.714+07	dwimuklis@gmail.com	\N	user	t
101195738940952486166	WarPan JAYA	https://lh3.googleusercontent.com/a/AGNmyxa4U3iDsUDJqqtN00K5i7OX02_E6OPSchPIfYav=s96-c	\N	101195738940952486166	USER	GOOGLE		1970-01-01	2023-03-03 12:44:26.691+07	warpanjaya@gmail.com	\N	user	t
109518472135890697242	Nur Kholis	https://lh3.googleusercontent.com/a/AGNmyxbWPCzD4UZf_RXpd9QLu3geyCjAPfNPpzac6Kgu=s96-c	\N	109518472135890697242	USER	GOOGLE		1970-01-01	2023-03-08 15:27:09.461+07	knur79846@gmail.com	\N	user	t
master|42	JULIA MAHARANI S.H., M.Kn.	https://master.bkd.jatimprov.go.id/files_jatimprov/42-file_foto-20160425-488-197901142003122001_resize.JPG	42	master	USER	MASTER	197901142003122001	1979-01-14	2023-03-03 16:36:28.939+07	aisyahfirdaus2@gmail.com	12303	admin	t
master|19431	MUHAIMIN	https://master.bkd.jatimprov.go.id/files_jatimprov/19431-file_foto-20200923-459-muhaimin2.jpg	19431	master	USER	MASTER	197810102009031002	1978-10-10	2023-03-10 22:15:58.188+07	muhaimin@sman1batu.sch.id	1052710020101	user	f
116227970284801305887	Zhulfi Bajra	https://lh3.googleusercontent.com/a/AGNmyxZRg8RHZQmUIEDOayAoR789Hjp4n56cblB_53WyVrE=s96-c	\N	116227970284801305887	USER	GOOGLE		1970-01-01	2023-03-03 21:32:36.175+07	wikjatmiko@gmail.com	\N	user	f
108422352061899836997	OvoRo	https://lh3.googleusercontent.com/a/AGNmyxa8OEV5ul1uNmkifknpYriWnQgnRsorJrEdPpkUkA=s96-c	\N	108422352061899836997	USER	GOOGLE		1970-01-01	2023-03-04 09:11:54.774+07	ovoromo@gmail.com	\N	user	t
master|48655	ANWAR	https://master.bkd.jatimprov.go.id/files_jatimprov/48655-file_foto-20220221-200-21.Anwar.JPG	48655	master	USER	MASTER	196607171993021002	1966-07-17	2023-03-04 11:18:45.74+07	raharjoanwar194@yahoo.co.id	1121601	user	f
118113011408094583493	Sudar sono	https://lh3.googleusercontent.com/a/AGNmyxZHzqZTuGY-at2LOKDG9fhp3ClXDbi_XRMtrqB1=s96-c	\N	118113011408094583493	USER	GOOGLE		1970-01-01	2023-03-04 13:29:52.471+07	ss2904665@gmail.com	\N	user	t
100664166411554449794	Haiyi Muhammad	https://lh3.googleusercontent.com/a/AGNmyxbpOpKmxDWLjXu8tCK7Ou7GfxHIp8qHnRjeI_g90jc=s96-c	\N	100664166411554449794	USER	GOOGLE		1970-01-01	2023-03-04 17:51:41.462+07	haiyim12@gmail.com	\N	user	t
master|56545	INTAN APRILIA DIANA PUTRI S.E.	https://master.bkd.jatimprov.go.id/files_jatimprov/56545-file_foto-20190720-92-DSC_0457.JPG	56545	master	USER	MASTER	199504022019032013	1995-04-02	2023-03-27 13:52:37.965+07	intan.adp2014@gmail.com	12306	admin	f
104873506367282058799	syukoer abd	https://lh3.googleusercontent.com/a/AGNmyxY8FrFFzMO9I-s_luysPIGDt0F2rOEZoCijV8E-=s96-c	\N	104873506367282058799	USER	GOOGLE		1970-01-01	2023-03-04 18:29:17.714+07	syukoera@gmail.com	\N	user	t
109575176269534486573	BPS KABUPATEN BANGKALAN	https://lh3.googleusercontent.com/a/AGNmyxYmHXYHIL8HvxzLoQoeq0jlQugs51WwqZh6CBUW=s96-c	\N	109575176269534486573	USER	GOOGLE		1970-01-01	2023-03-04 23:40:04.749+07	bps35260@gmail.com	\N	user	t
102345187658065083913	Andi Whira	https://lh3.googleusercontent.com/a/AGNmyxY5cCfnN83InNDk-_oxD8LUw6AS-gyoomXam1l4=s96-c	\N	102345187658065083913	USER	GOOGLE		1970-01-01	2023-03-08 13:11:22.021+07	andiwhira48@gmail.com	\N	user	t
103830938037949554523	Muhammad Majid	https://lh3.googleusercontent.com/a/AGNmyxbvnrpZ1zZLEZMQ7MnsKO7CtWUpsdyXliKC43Rc=s96-c	\N	103830938037949554523	USER	GOOGLE		1970-01-01	2023-03-09 21:42:48.273+07	nicoarsahavin85@gmail.com	\N	user	t
114271127042911563816	Jo Anaku	https://lh3.googleusercontent.com/a/AGNmyxZtAVT-VM3JuwxEbVxOoHt_YclRcqoeA1nN0oSN=s96-c	\N	114271127042911563816	USER	GOOGLE		1970-01-01	2023-03-06 14:22:36.229+07	anakujo01@gmail.com	\N	user	t
100898213862692765791	Hakim anggi	https://lh3.googleusercontent.com/a/AGNmyxbpwgGcCV4_trHqULS3-DHsMKbTzlXdUBCiSr0o=s96-c	\N	100898213862692765791	USER	GOOGLE		1970-01-01	2023-03-05 20:46:44.197+07	hakimanggi1009@gmail.com	\N	user	f
107320671397204374523	Doni Darwin	https://lh3.googleusercontent.com/a/AGNmyxYDZnkHbI6SseiWOkMMqQrDagTPm49PZuQ4uNfEAD0=s96-c	\N	107320671397204374523	USER	GOOGLE		1970-01-01	2023-03-07 09:35:45.282+07	danctuary@gmail.com	\N	user	t
master|66870	FIRDAUS DONI SAPUTRA S.Pd.	https://master.bkd.jatimprov.go.id/files_jatimprov/66870-file_foto-20220713-926-DONI_(1)_(1).jpg	66870	master	USER	MASTER	199202242022211009	1992-02-24	2023-03-24 23:25:47.686+07	firdaus.donie@gmail.com	1053210011902	user	t
109485237600040517247	Raden ATWi	https://lh3.googleusercontent.com/a/AGNmyxaElrKDShqyCGMbUcHzPlR5UvPOlY2FUGy17jTW=s96-c	\N	109485237600040517247	USER	GOOGLE		1970-01-01	2023-03-08 10:45:35.361+07	ratwi2108@gmail.com	\N	user	f
master|60483	FAJRIAN ILHAM FARIDHO S.STP	https://master.bkd.jatimprov.go.id/files_jatimprov/60483-file_foto-20211206-757-PROFIL_ME1.jpg	60483	master	USER	MASTER	199610142020081001	1996-10-14	2023-03-10 09:46:02.053+07	fajrianfaridho@yahoo.co.id	12302	agent	t
pttpk|3655	MIKKE OKTAVIANTI, ST	https://bkd.jatimprov.go.id/pttpk/upload_foto/3655_MG_8614.JPG 	3655	pttpk	USER	PTTPK	116071019811020103655	1981-10-07	2023-03-07 22:01:21.197+07	mikke.oktavianti@gmail.com	130	user	t
master|58318	ERNA SULISTIYAN S.Pd	https://master.bkd.jatimprov.go.id/files_jatimprov/58318-file_foto-20190716-309-0468.jpg	58318	master	USER	MASTER	198604102019032007	1986-04-10	2023-03-06 21:59:13.707+07	ernasulistiyan5@gmail.com	1053210011402	user	t
109952898139499803570	Cakrawartya Danuja	https://lh3.googleusercontent.com/a/AGNmyxbhI2Z5kWhhI0vK-ZIM-1k9mY5PE4gdKFdHvW61=s96-c	\N	109952898139499803570	USER	GOOGLE		1970-01-01	2023-03-06 22:03:57.913+07	cakrawartya67@gmail.com	\N	user	t
master|58521	CHELSI DAYANARA IKSANINDYA S.IP	https://master.bkd.jatimprov.go.id/files_jatimprov/58521-file_foto-20210104-435-imgonline-com-ua-CompressToSize-DkuLhr4SV77vBjw.jpg	58521	master	USER	MASTER	199608292019082001	1996-08-29	2023-03-20 13:50:38.377+07	chelsidayanara@gmail.com	12303	admin	t
110594523576593972208	Budi Hernando	https://lh3.googleusercontent.com/a/AGNmyxbLJYzQUjcyvdbNXfiK6lNVVymCljNHa7prO4hTIw=s96-c	\N	110594523576593972208	USER	GOOGLE		1970-01-01	2023-03-07 22:17:12.838+07	budihernando00@guru.smp.belajar.id	\N	user	t
111599891030569743286	Achmad Zainullah	https://lh3.googleusercontent.com/a/AGNmyxbGyDFZRb8-V4mytxovYB_Q-jHb7iJpaTaPGiGPlw=s96-c	\N	111599891030569743286	USER	GOOGLE		1970-01-01	2023-03-08 08:01:48.573+07	zainullahachmad31@gmail.com	\N	user	t
master|63137	RAHMAN YUSRI AFTIAN S.HI, ME	https://master.bkd.jatimprov.go.id/files_jatimprov/63137-file_foto-20220511-633-Rahman_Foto.jpg	63137	master	USER	MASTER	198403212022211017	1984-03-21	2023-03-09 16:31:05.287+07	aftian9603@gmail.com	10535100602	user	t
100820938375550812284	bayu segoro	https://lh3.googleusercontent.com/a/AGNmyxaya8jWn7W66KxGQ6matsvcznlXIPm-ktNrAhUFmw=s96-c	\N	100820938375550812284	USER	GOOGLE		1970-01-01	2023-03-08 14:51:56.601+07	bayusegoro00@gmail.com	\N	user	t
117039184908934929861	Fitria Kartika Arumsari	https://lh3.googleusercontent.com/a/AGNmyxad4XwGzoqOnUTKR7qWkf8ISgoQO9tSwsUcDe0l3LM=s96-c	\N	117039184908934929861	USER	GOOGLE		1970-01-01	2023-03-08 11:37:48.292+07	sharifitria96@gmail.com	\N	user	t
112930744005332427012	ARIF DEVIT WAYAN DIANA	https://lh3.googleusercontent.com/a/AGNmyxbfaeXK54N8iAlyjHiP9Ns_yIK4VkmUaQ-9uFeV=s96-c	\N	112930744005332427012	USER	GOOGLE		1970-01-01	2023-03-08 14:33:47.209+07	ariefdiana11@guru.sma.belajar.id	\N	user	t
104364386575090013255	Indah Sri Wahyuti	https://lh3.googleusercontent.com/a/AGNmyxaXswnpXqIsiIz4PgLXV27rxMNmFANghT1bMnIwbBo=s96-c	\N	104364386575090013255	USER	GOOGLE		1970-01-01	2023-03-08 14:52:54.083+07	indahsriwahyuti@gmail.com	\N	user	t
master|56553	ALICIA PUSPITASARI S.Psi.	https://master.bkd.jatimprov.go.id/files_jatimprov/56553-file_foto-20220815-144-56553-file_foto-20190720-325-DSC_0445-removebg-preview_11zon.jpg	56553	master	USER	MASTER	199205072019032021	1992-05-07	2023-03-22 21:35:24.581+07	aliciapuspitasari@gmail.com	12306	admin	t
master|56590	DIANA ROSYIDA S.Si.	https://master.bkd.jatimprov.go.id/files_jatimprov/56590-file_foto-20190706-102-Half_Body_-_Diana.jpg	56590	master	USER	MASTER	199409092019032022	1994-09-09	2023-03-23 22:15:11.945+07	dianarosyida94@gmail.com	12405	user	t
114926753972067264754	sonia sharma	https://lh3.googleusercontent.com/a/AGNmyxbDmpH6jYp-Z_97U07RYW_Fz-LuVM8YdbGnwcZC=s96-c	\N	114926753972067264754	USER	GOOGLE		1970-01-01	2023-03-08 17:07:28.969+07	sonia.sharma506@gmail.com	\N	user	t
101142547976358374810	Muhamim Sarifudin	https://lh3.googleusercontent.com/a/AGNmyxar4smiu5W1XLzH_KLDzWVtdYkI9Kyp5pqwv2vZhw=s96-c	\N	101142547976358374810	USER	GOOGLE		1970-01-01	2023-03-08 17:35:58.527+07	muhamimsy@gmail.com	\N	user	t
112511991812154114514	Vhey Permatasari	https://lh3.googleusercontent.com/a/AGNmyxYuBydnO8NvBclF25X7B0cqeajwRcIN9rKW0aOR5Q=s96-c	\N	112511991812154114514	USER	GOOGLE		1970-01-01	2023-03-08 18:35:34.353+07	vhey.permatasari@gmail.com	\N	user	t
master|61543	AHMAD SYAUQI ABRORI A.Md.Kes.	https://master.bkd.jatimprov.go.id/files_jatimprov/61543-file_foto-20221107-786-20221107_074339_200kb.jpg	61543	master	USER	MASTER	199606282022041001	1996-06-28	2023-03-08 18:41:26.388+07	abror.syauqi@gmail.com	103120201	user	t
106221904072757493129	Luluk Nurhamidah	https://lh3.googleusercontent.com/a/AGNmyxYEo4GVboPAOBzGNhEy964ucRtlmBRlkxD36T4r=s96-c	\N	106221904072757493129	USER	GOOGLE		1970-01-01	2023-03-25 01:31:22.915+07	luluknurhamidah20@guru.sma.belajar.id	\N	user	t
105126464846449076179	Fadhli Darmayufeza	https://lh3.googleusercontent.com/a/AGNmyxaGKaboFT8tt5QpLGmKxCFvgB4j4ni3XFT_1Tqf=s96-c	\N	105126464846449076179	USER	GOOGLE		1970-01-01	2023-03-10 15:25:43.282+07	pengeloladata31@gmail.com	\N	user	f
111128017015886258179	yusda herdian	https://lh3.googleusercontent.com/a/AGNmyxb_AhRmrkUs19_Nl1diN0YTQ9r6gh6KGPIhJesg=s96-c	\N	111128017015886258179	USER	GOOGLE		1970-01-01	2023-03-08 21:50:41.843+07	yusdaherdian9@gmail.com	\N	user	t
105802369360167760043	Arum Hendras	https://lh3.googleusercontent.com/a/AGNmyxa11pLjfltLipXYXkVpEGjAxxcFu1r90wU9OXk40Q=s96-c	\N	105802369360167760043	USER	GOOGLE		1970-01-01	2023-03-08 23:12:37.694+07	arumhendras@gmail.com	\N	user	t
103725723628207799245	Yudana Jp	https://lh3.googleusercontent.com/a/AGNmyxbTGBHnn9rczwB8OnLjRkbXZh6uX2em4jngPaKnfA=s96-c	\N	103725723628207799245	USER	GOOGLE		1970-01-01	2023-03-09 06:15:12.371+07	yudanajp@gmail.com	\N	user	t
master|36782	IKHWAN FANANI MARWI SE	https://master.bkd.jatimprov.go.id/files_jatimprov/36782-file_foto-20160712-572-152_ikhwan_fanani_marwi.jpg	36782	master	USER	MASTER	198110062015031001	1981-10-06	2023-03-10 08:28:43.941+07	ikhwan.fanani99@gmail	103140101	user	f
master|88	RAJMA TRI HANDOKO S.IP., M.PSDM.	https://master.bkd.jatimprov.go.id/files_jatimprov/88-file_foto-20220307-969-rajma.jpg.jpg	88	master	USER	MASTER	198603192011011010	1986-03-19	2023-03-17 20:48:06.099+07	rajma.1908@gmail.com	12302	agent	t
111381999817269815956	nendy dayu	https://lh3.googleusercontent.com/a/AGNmyxZzjgHV9VRnHfJe2swmPa6Ue22drDdT0o7KOycO=s96-c	\N	111381999817269815956	USER	GOOGLE		1970-01-01	2023-03-09 10:35:39.284+07	nendydayu212@gmail.com	\N	user	t
115664366032476059966	Fidela Putri	https://lh3.googleusercontent.com/a/AGNmyxarypOs9-Bef4CJkNbBcUmMKrbRYthayFQtrxmu=s96-c	\N	115664366032476059966	USER	GOOGLE		1970-01-01	2023-03-09 12:10:37.936+07	fidelaputriayudya01@gmail.com	\N	user	t
100810163707352883446	fit kurma	https://lh3.googleusercontent.com/a/AGNmyxbi42bWtFQhrmuZXmgQT0XHXHPysWAa5YGiFeDO=s96-c	\N	100810163707352883446	USER	GOOGLE		1970-01-01	2023-03-10 07:54:41.871+07	kurmawatifi3@gmail.com	\N	user	t
pttpk|12246	RIYATUL HASANAH, S.AP.	https://bkd.jatimprov.go.id/pttpk/upload_foto/12246e6571e03-7f24-47c8-9ec8-37f4972d2a67-min.jpg 	12246	pttpk	USER	PTTPK	10216040519960520220621	1996-05-04	2023-03-10 08:31:56.067+07	riyatul43@gmail.com	10314	user	t
106670716959978158773	Adi Sutito	https://lh3.googleusercontent.com/a/AGNmyxYlOieMv4XGoZaSkzybxSD7k1DPOXAjQpz3qPRlkE0=s96-c	\N	106670716959978158773	USER	GOOGLE		1970-01-01	2023-03-10 09:53:36.989+07	masadisutito@gmail.com	\N	user	t
master|57561	ANDI RESKI BATARI A. Md. Ft	https://master.bkd.jatimprov.go.id/files_jatimprov/57561-file_foto-20220925-777-png_20220925_163912_0000-min.png	57561	master	USER	MASTER	199301032019032019	1993-01-03	2023-03-11 09:09:23.063+07	reskibatari@gmail.com	103210132	user	t
113590622065689285619	Sirr Dimas	https://lh3.googleusercontent.com/a/AGNmyxaKF75gIQQCoUsg9vcCERwhdgXiT_ATWJrdhVtR=s96-c	\N	113590622065689285619	USER	GOOGLE		1970-01-01	2023-03-10 10:04:36.771+07	dimassirr@gmail.com	\N	user	t
100278030146825019082	Vera Prima	https://lh3.googleusercontent.com/a/AGNmyxbSojMnsLr5uhQHZFJH2bTAhfTr734WZkF2tDLT=s96-c	\N	100278030146825019082	USER	GOOGLE		1970-01-01	2023-03-10 22:19:17.759+07	veraprima0804@gmail.com	\N	user	t
104188047376455869619	Mas Lis	https://lh3.googleusercontent.com/a/AGNmyxaizRSNJDi7hZxKvy487YwDTIYz_Xs0L681-Ou3dA=s96-c	\N	104188047376455869619	USER	GOOGLE		1970-01-01	2023-03-10 14:02:21.258+07	sulistiyono1977@gmail.com	\N	user	t
111112829188571634273	blok Bojonegoro	https://lh3.googleusercontent.com/a/AGNmyxbQnRJ9uEe1Y-hMthjI1MAoMZPSQ0LNcuu8PBUr=s96-c	\N	111112829188571634273	USER	GOOGLE		1970-01-01	2023-03-10 16:27:02.757+07	blokbojonegoro@gmail.com	\N	user	t
109993441263825023282	Fikri abdillah	https://lh3.googleusercontent.com/a/AGNmyxYWx1FmHw_UhvNgNQ3KYS5tjzIznDQvNfgkoMQR=s96-c	\N	109993441263825023282	USER	GOOGLE		1970-01-01	2023-03-20 20:36:51.77+07	fabdillah47@gmail.com	\N	user	t
103904187960603834337	Subbid Perencanaan dan Formasi	https://lh3.googleusercontent.com/a/AGNmyxY4yiwaXHq4jEPhOwOzij_6eh4RIY6Lp-VG52iT=s96-c	\N	103904187960603834337	USER	GOOGLE		1970-01-01	2023-03-10 10:06:55.431+07	formasi.jatimprov@gmail.com	\N	user	f
111168556735900934745	Seksi SDMKjember	https://lh3.googleusercontent.com/a/AGNmyxaYCzoypX_fWmxTF1H5cQI6HgdTDzLJway1OMv1=s96-c	\N	111168556735900934745	USER	GOOGLE		1970-01-01	2023-03-10 20:55:33.79+07	seksisdmkjember@gmail.com	\N	user	t
100154973142512312770	M. Nur Muharrom	https://lh3.googleusercontent.com/a/AGNmyxZHGRv5ncQl40uC4iGUY6TJuEpVRwUlKdmNWqj08w=s96-c	\N	100154973142512312770	USER	GOOGLE		1970-01-01	2023-03-11 22:14:59.799+07	mmuharrom08@guru.smk.belajar.id	\N	user	t
110946429403398773538	aqilah sarda	https://lh3.googleusercontent.com/a/AGNmyxa3qPLIZtvqGd30g60r2EXTJwCN6O2vScCL-InD=s96-c	\N	110946429403398773538	USER	GOOGLE		1970-01-01	2023-03-10 23:34:14.021+07	aqilahsarda@gmail.com	\N	user	t
113567613428615339336	Erwin setyono	https://lh3.googleusercontent.com/a/AGNmyxbX0HjhQ3drOM39w7xvqzeW19nI57dNXN3NQnPV_w=s96-c	\N	113567613428615339336	USER	GOOGLE		1970-01-01	2023-03-17 12:32:02.997+07	erwinsetyono81@gmail.com	\N	user	t
118000452470797953587	Wuri Eritasari (weritasari)	https://lh3.googleusercontent.com/a/AGNmyxbA3rbF1OPeB8soGFU9w4eONkEoobI2lmgpL39ZUZs=s96-c	\N	118000452470797953587	USER	GOOGLE		1970-01-01	2023-03-11 00:09:55.038+07	wurieritasari@gmail.com	\N	user	f
111621747819290560388	Ayuretno Ningtyas	https://lh3.googleusercontent.com/a/AGNmyxYSY4LfnwYfCbJdH_8rxHpQ8qcPwnoLxUCCSc4O=s96-c	\N	111621747819290560388	USER	GOOGLE		1970-01-01	2023-03-11 13:52:07.158+07	ayuretnoningtyas89@gmail.com	\N	user	t
101421584723523434795	Su Warno	https://lh3.googleusercontent.com/a/AGNmyxZEEG5a6256FgarqtXafCQ0TEB9LGCI3Yy2IAir=s96-c	\N	101421584723523434795	USER	GOOGLE		1970-01-01	2023-03-11 15:19:47.244+07	suwarnopoluan@gmail.com	\N	user	t
master|49346	GALIH PERWIRA KUSUMA S.STP, M.M	https://master.bkd.jatimprov.go.id/files_jatimprov/49346-file_foto-20160815-766-GALIH_PERWIRA.jpg	49346	master	USER	MASTER	199011262010101002	1990-11-26	2023-03-11 23:24:11.108+07	galihperwirakusuma@ymail.com	101010201	user	t
101261832735106680106	Rifia Amalia Santi	https://lh3.googleusercontent.com/a/AGNmyxaGV_WMK3Y0w0Ftm7IQC_JX0F9q2kkDKfWTY3UJ=s96-c	\N	101261832735106680106	USER	GOOGLE		1970-01-01	2023-03-12 06:38:00.636+07	rifiaamaliasanti@gmail.com	\N	user	t
111613221740802737569	Wardil Lathif	https://lh3.googleusercontent.com/a/AGNmyxZavkrq06YgDoRQgZEQTMj0TLUn1sZ3dl-H_69spA=s96-c	\N	111613221740802737569	USER	GOOGLE		1970-01-01	2023-03-12 09:04:57.753+07	wardilart@gmail.com	\N	user	t
107166598344454520238	Novi Udhiyana	https://lh3.googleusercontent.com/a/AGNmyxaRQXTvI62zPqxJWYL1xQ6MMIcP5mUr-O2DRpKknA=s96-c	\N	107166598344454520238	USER	GOOGLE		1970-01-01	2023-03-13 08:07:13.314+07	udhiyananovi@gmail.com	\N	user	t
102394307718819695325	14_Ilham Indra Wijayanto	https://lh3.googleusercontent.com/a/AGNmyxYrvNRM6NPV-TO9du7OBOAIoW7dtPusXBJES9Fq6Q=s96-c	\N	102394307718819695325	USER	GOOGLE		1970-01-01	2023-03-17 09:31:18.243+07	ilhamindrawijaya26@gmail.com	\N	user	t
100368901838656544022	Sebty Intan	https://lh3.googleusercontent.com/a/AGNmyxbi_e3o-YZ-ygJS-JDOEb6N79cpvfyHRJF_kHzlhQ=s96-c	\N	100368901838656544022	USER	GOOGLE		1970-01-01	2023-03-13 09:56:22.293+07	sebtyintanwandysa92@gmail.com	\N	user	t
master|53054	ENDANG SRI UTAMI AMd.Kep	https://master.bkd.jatimprov.go.id/files_jatimprov/53054-file_foto-20160913-954-0196_ENDANG_SRI_UTAMI.jpg	53054	master	USER	MASTER	197303131997032004	1973-03-13	2023-03-15 05:26:27.599+07	endangsriutamiwkb@gmail.com	103240107	user	t
109340699343404319221	Arief Purnomo	https://lh3.googleusercontent.com/a/AGNmyxa58RTuSQge63BpblTkLAfn2nu0_brjGP5B-hlJ=s96-c	\N	109340699343404319221	USER	GOOGLE		1970-01-01	2023-03-15 10:56:44.025+07	purnomoarief83@gmail.com	\N	user	t
117234910457793432503	rudi aris	https://lh3.googleusercontent.com/a/AGNmyxY3jA7k6cTAMYgsjoUSJ5JL_0C6SfGND0MrllYf=s96-c	\N	117234910457793432503	USER	GOOGLE		1970-01-01	2023-03-15 20:47:11.574+07	arisrudi229@gmail.com	\N	user	t
104052548613068363671	Hendro Suryono	https://lh3.googleusercontent.com/a/AGNmyxYDjW4bLR7TqmFjg456zYI3Fkd4mDrPwDkSYJGuAA=s96-c	\N	104052548613068363671	USER	GOOGLE		1970-01-01	2023-03-17 09:37:42.561+07	batosainagoya69@gmail.com	\N	user	t
master|61648	Apt. ANIEK WIDAYANTI S.Si	https://master.bkd.jatimprov.go.id/files_jatimprov/61648-file_foto-20221219-865-setengah_badan_(1).jpg	61648	master	USER	MASTER	198607072022042001	1986-07-07	2023-03-15 06:09:41.87+07	aniekwidayantinew@gmail.com	103080201	user	t
100223887765725236648	Etty Fitria	https://lh3.googleusercontent.com/a/AGNmyxYdDyOWicOZrNJBxU4J6TuJoSm8Wnuo1rfWgpwq=s96-c	\N	100223887765725236648	USER	GOOGLE		1970-01-01	2023-03-13 11:04:54.464+07	etty97@gmail.com	\N	user	t
110240501963703052736	reza zulkarnain	https://lh3.googleusercontent.com/a/AGNmyxbsE23H1lN7SlCGVt1C3XAHbr4wtafGHmfx-BA=s96-c	\N	110240501963703052736	USER	GOOGLE		1970-01-01	2023-03-13 16:29:44.066+07	reza.zulkarnain.arifin@gmail.com	\N	user	t
111822754184396617112	Eka Di	https://lh3.googleusercontent.com/a/AGNmyxZaYZ2t-2xJavznMiycsd--moF1aoEyH3GE3LkC=s96-c	\N	111822754184396617112	USER	GOOGLE		1970-01-01	2023-03-15 07:12:23.768+07	exadins17@gmail.com	\N	user	t
112361222002881606162	Dhika Putra	https://lh3.googleusercontent.com/a/AGNmyxYnj4ZC52qARp6O996Kbp2949-21WgZ_HBrp7YQ=s96-c	\N	112361222002881606162	USER	GOOGLE		1970-01-01	2023-03-15 07:20:23.329+07	dhikaputra1236@gmail.com	\N	user	t
master|56542	RIZKY AMELIA S.Psi.	https://master.bkd.jatimprov.go.id/files_jatimprov/56542-file_foto-20230221-551-56542-file_foto-20190720-545-DSC_0466-removebg-preview-removebg-preview.jpg	56542	master	USER	MASTER	199111242019032014	1991-11-24	2023-03-15 16:33:54.776+07	eq.rizkyamelia@gmail.com	12302	agent	f
master|49741	NIDAUL HIDAYAH S.STP	https://master.bkd.jatimprov.go.id/files_jatimprov/49741-file_foto-20180828-415-foto_set.jpeg	49741	master	USER	MASTER	199301032017082001	1993-01-03	2023-03-15 09:18:06.473+07	nidaul0301@gmail.com	12302	agent	t
109519324217779397280	Reditiyo Yuniartanto	https://lh3.googleusercontent.com/a/AGNmyxaWKxQu2Getz4XOy1bOxYRxsCDp3BB7IHgKmmrB=s96-c	\N	109519324217779397280	USER	GOOGLE		1970-01-01	2023-03-15 21:12:08.323+07	reditiyoyuniartanto26@guru.smk.belajar.id	\N	user	t
115238708099872935569	Alun Gusninda	https://lh3.googleusercontent.com/a/AGNmyxY17UPH8t6FJwk3awI1iw8UUFYUSSzPYWcqJPdx=s96-c	\N	115238708099872935569	USER	GOOGLE		1970-01-01	2023-03-15 03:35:05.798+07	algndas@gmail.com	\N	user	t
102261205723220230926	lutfiyah wiejaya	https://lh3.googleusercontent.com/a/AGNmyxbceEVNV0Ea4_tbnywE_-2KXUyr-oLridmf0iIR=s96-c	\N	102261205723220230926	USER	GOOGLE		1970-01-01	2023-03-15 11:31:40.349+07	lutfiyahajach@gmail.com	\N	user	t
101433152859498979994	Agung 123	https://lh3.googleusercontent.com/a/AGNmyxaIoBwoefZfB2ik6JIC5aSkMC70KrEpYFQvT5QP=s96-c	\N	101433152859498979994	USER	GOOGLE		1970-01-01	2023-03-15 21:19:49.042+07	saputrobjn@gmail.com	\N	user	t
master|68042	FAIZATUL HANAFIYAH S.Pd., M.Pd.	https://master.bkd.jatimprov.go.id/files_jatimprov/68042-file_foto-20220614-974-IMG_4678_FAIZA_EDIT.jpg	68042	master	USER	MASTER	199201012022212038	1992-01-01	2023-03-15 12:04:28.722+07	fay.hanafa@gmail.com	10521100205	user	t
master|58237	HENI HAMDIYAH S.Tr. Pi.	https://master.bkd.jatimprov.go.id/files_jatimprov/58237-file_foto-20191007-275-WhatsApp_Image_2019-10-07_at_07.51.53.jpeg	58237	master	USER	MASTER	199405272019032016	1994-05-27	2023-03-15 12:40:21.136+07	henihamdiyah67@gmail.com	10535101602	user	t
master|10593	NURIEL HUDAWATI S.Pd.	https://master.bkd.jatimprov.go.id/files_jatimprov/10593-file_foto-20160531-200-Nuril.jpg	10593	master	USER	MASTER	198711262011012017	1987-11-26	2023-03-16 07:45:59.332+07	nurielhudawati@gmail.com	1052610010102	user	t
master|34625	AHMAD HARIS UBAIDILLAH S.ST.	https://master.bkd.jatimprov.go.id/files_jatimprov/34625-file_foto-20200905-599-0b4b6996-b685-43ea-bbcc-8d1f92e6c92a.jpg	34625	master	USER	MASTER	198603222015041002	1986-03-22	2023-03-17 09:18:05.814+07	harisvrizas@gmail.com	10537101902	user	t
106597462782376347245	Muflihatul Maghfirah	https://lh3.googleusercontent.com/a/AGNmyxZZbIRIKo-SqqvPoZyOstTLxoMqd9SakitGutWY=s96-c	\N	106597462782376347245	USER	GOOGLE		1970-01-01	2023-03-16 08:28:30.016+07	muflihatulmaghfirah@gmail.com	\N	user	t
110556506252010760909	Ayu Muhimmatul Kholidah	https://lh3.googleusercontent.com/a/AGNmyxZRbR75nLT2mcEj2P5vy-LG6IsQVJb3b0tv9Uml=s96-c	\N	110556506252010760909	USER	GOOGLE		1970-01-01	2023-03-19 03:41:38.473+07	ayufsl@gmail.com	\N	user	t
100597502092332672020	Tanfidzyah Farah Rizfah	https://lh3.googleusercontent.com/a/AGNmyxYrnesT-60sZAae2PVg71UJVyhwMcA8vGZ2CNrT=s96-c	\N	100597502092332672020	USER	GOOGLE		1970-01-01	2023-03-27 10:25:46.871+07	tanfidzyah.fah65@gmail.com	\N	user	t
112226202854798199276	ega kukm	https://lh3.googleusercontent.com/a/AGNmyxZrZLBn_GgfJfQo4Wch8uyCQZTLMYjnhVvd1rJk=s96-c	\N	112226202854798199276	USER	GOOGLE		1970-01-01	2023-03-16 11:04:49.782+07	egakukm@gmail.com	\N	user	t
105519991687513043699	Alief Hafizh	https://lh3.googleusercontent.com/a/AGNmyxbpjiTucvl57YIRDJEv-1c6D_iYgWLEhL489gf3xA=s96-c	\N	105519991687513043699	USER	GOOGLE		1970-01-01	2023-03-16 12:35:09.05+07	alief.hafizh88@gmail.com	\N	user	t
master|61660	ERNA NUR JUHROTUL LAILI S.Kep.,Ns.	https://master.bkd.jatimprov.go.id/files_jatimprov/61660-file_foto-20220814-211-P8140864__ERNA_4_x_6-removebg-preview.jpg	61660	master	USER	MASTER	199612152022042001	1996-12-15	2023-03-18 07:14:01.422+07	erna.njl15@gmail.com	103080202	user	t
102189233827310807392	Arif Firmansyah	https://lh3.googleusercontent.com/a/AGNmyxZeuyAR5aw_MQ0RcwefRAp8Y7HrIBqra_Mo2YZD6g=s96-c	\N	102189233827310807392	USER	GOOGLE		1970-01-01	2023-03-20 05:20:39.153+07	sixmansyah@gmail.com	\N	user	t
112783934124447116178	Hari Hattra	https://lh3.googleusercontent.com/a/AGNmyxYoU6cqHP2DXEYF3ElC8CIxvP-aNnCMLBcPvcp9=s96-c	\N	112783934124447116178	USER	GOOGLE		1970-01-01	2023-03-16 18:52:20.101+07	harihattra@gmail.com	\N	user	t
104460524392915594918	wididana 20	https://lh3.googleusercontent.com/a/AGNmyxa-cxIDl2K4Pjee_Do5pBkBEIJviEa48n_vDUBo=s96-c	\N	104460524392915594918	USER	GOOGLE		1970-01-01	2023-03-17 04:26:35.169+07	wahyuwidhip597@gmail.com	\N	user	t
109944690488491973450	Fauzi Bpkad	https://lh3.googleusercontent.com/a/AGNmyxaAPSu9V-CsI2PI7T3-aHghhp46Wwuz0i7jlH-d=s96-c	\N	109944690488491973450	USER	GOOGLE		1970-01-01	2023-03-17 07:43:13.746+07	fauzibpkad@gmail.com	\N	user	t
master|56814	DESTA KURNIA DEWI S.IIP.	https://master.bkd.jatimprov.go.id/files_jatimprov/56814-file_foto-20221226-814-D9FED96E-0D6E-4C90-8920-4F3A6E66FE2D.jpg	56814	master	USER	MASTER	199401122019032019	1994-01-12	2023-03-17 09:52:54.754+07	destakurniadewi@gmail.com	13304	user	t
master|62055	ALVINURA FAJRIN S.ST.	https://master.bkd.jatimprov.go.id/files_jatimprov/62055-file_foto-20220407-521-0.b_Foto_Setengah_Badan.jpg	62055	master	USER	MASTER	199506282022041001	1995-06-28	2023-03-18 07:29:53.6+07	af.pro1001@gmail.com	1081704	user	t
114271680703150740327	Hasprina Resmaniar Boru Mangoensong	https://lh3.googleusercontent.com/a/AGNmyxb2DAfrNaBRS6XF7icTrRytLfPJ2hXtDEe2RtfH=s96-c	\N	114271680703150740327	USER	GOOGLE		1970-01-01	2023-03-17 13:17:37.945+07	hasprinamangoensong17@guru.smk.belajar.id	\N	user	t
106421360554716345525	elvin firmanda	https://lh3.googleusercontent.com/a/AGNmyxbn4v9ubd0kuNSZsQncmkY8hah0qrMjHRo_1cc4=s96-c	\N	106421360554716345525	USER	GOOGLE		1970-01-01	2023-03-17 13:57:01.024+07	elvinfirmanda1982@gmail.com	\N	user	t
111511155205878625323	Karnadi Karnadi	https://lh3.googleusercontent.com/a/AGNmyxapRztY9aXk06BYVfs7lyu3vjupEpExzuYI0rZ2=s96-c	\N	111511155205878625323	USER	GOOGLE		1970-01-01	2023-03-17 14:12:14.545+07	karnadik903@gmail.com	\N	user	t
112207765883359023224	Muhamad Ali Ikhsanudin	https://lh3.googleusercontent.com/a/AGNmyxasj5LBB9x8qhWeHh-o1wbw087VDFxiS7KFytPk=s96-c	\N	112207765883359023224	USER	GOOGLE		1970-01-01	2023-03-17 15:24:34.35+07	buatbelajar2020@gmail.com	\N	user	t
master|4057	MUHAMMAD MIRZAQ SYAHRIAL ALAFI A.Md.Farm., S.Kom.	https://master.bkd.jatimprov.go.id/files_jatimprov/4057-file_foto-20160830-800-bkd_01.jpg	4057	master	USER	MASTER	198712122014031001	1987-12-12	2023-03-26 21:16:10.912+07	inimirza@gmail.com	103210127	user	f
116323827092224767329	yuliana pradita	https://lh3.googleusercontent.com/a/AGNmyxaZX6SfL_GqYftMvL8s4ec71we8mUD6pRrloCzm3qs=s96-c	\N	116323827092224767329	USER	GOOGLE		1970-01-01	2023-03-17 18:21:33.686+07	yulianapradita9@gmail.com	\N	user	t
101635276541032067228	Wiji Wahyu	https://lh3.googleusercontent.com/a/AGNmyxYuQzpbsYPj-284Oov8MknD-I5P94Q-9SbDI944=s96-c	\N	101635276541032067228	USER	GOOGLE		1970-01-01	2023-03-17 20:20:30.98+07	wahyuwiji559@gmail.com	\N	user	t
104391872129791489591	Sulistyo Pambudi	https://lh3.googleusercontent.com/a/AGNmyxa6gf9CThyqKgBNji14sj3HlbOeRtK-V3YMx9qe=s96-c	\N	104391872129791489591	USER	GOOGLE		1970-01-01	2023-03-18 07:30:56.135+07	sulistyo038@gmail.com	\N	user	t
113527912472460121289	Winda l	https://lh3.googleusercontent.com/a/AGNmyxZ8ToJtNvagov86Flw2Q_PnvzLOsF13sepAF_qRRQ=s96-c	\N	113527912472460121289	USER	GOOGLE		1970-01-01	2023-03-18 07:41:46.382+07	windalucyana29@gmail.com	\N	user	t
master|62279	RIZKA MUNA AROFAH A.Md.Kep	https://master.bkd.jatimprov.go.id/files_jatimprov/62279-file_foto-20230113-611-Januari_2023_(711)-fococlipping-standard_11zon.jpeg	62279	master	USER	MASTER	199710272022042001	1997-10-27	2023-03-18 21:23:22.865+07	rizkamuna.arofah@gmail.com	103240701	user	t
master|62077	MUHAMAD ALI IKHSANUDIN S.Kom.	https://master.bkd.jatimprov.go.id/files_jatimprov/62077-file_foto-20220408-80-97F6235D-A59F-4B63-A758-0D779E3B433C.jpeg	62077	master	USER	MASTER	199012092022041001	1990-12-09	2023-03-18 08:30:06.294+07	ikhsanudin902017@gmail.com	1081804	user	f
master|61550	WINDA LUCYANA A.Md.	https://master.bkd.jatimprov.go.id/files_jatimprov/61550-file_foto-20230101-664-WINDA_LUCYANA_LAB_(1).jpg	61550	master	USER	MASTER	199503142022042001	1995-03-14	2023-03-22 05:53:01.01+07	windalucyana29@gmail.com	103120201	user	t
112926396832921719911	Wahyu Prasetyo Wibowo	https://lh3.googleusercontent.com/a/AGNmyxa9z3Bm67jeXn8mgzOn0c9yIvSBrw7H8obabJLo=s96-c	\N	112926396832921719911	USER	GOOGLE		1970-01-01	2023-03-20 08:58:14.622+07	wahyuwibowo63@guru.sma.belajar.id	\N	user	t
110303135123066864005	Faizatul Hanafiyah	https://lh3.googleusercontent.com/a/AGNmyxaHbiM1yl_UlJ7aDl2cRw-2P7nwd0cP2yvVcteAWY4=s96-c	\N	110303135123066864005	USER	GOOGLE		1970-01-01	2023-03-21 07:22:35.721+07	fay.hanafa@gmail.com	\N	user	t
115336653648009478118	Daudku2016	https://lh3.googleusercontent.com/a/AGNmyxYPfEDl0PF29E7xSTCBpMXh3zWxP26aaWA5igW8DQ=s96-c	\N	115336653648009478118	USER	GOOGLE		1970-01-01	2023-03-21 08:57:56.348+07	daudku2016@gmail.com	\N	user	t
113954074894686249728	Adi Dwi Pangga	https://lh3.googleusercontent.com/a/AGNmyxZJiichRd-_sk9y4rHnUZTS46-fwLibL0YfhkiG=s96-c	\N	113954074894686249728	USER	GOOGLE		1970-01-01	2023-03-20 15:35:51.75+07	adidwipangga29@gmail.com	\N	user	t
106895706821206096824	Luloek Latifah S.	https://lh3.googleusercontent.com/a/AGNmyxYjU9kHBt7kW98bXkaHmOHCMmEL-2WSQ_LtyI0I=s96-c	\N	106895706821206096824	USER	GOOGLE		1970-01-01	2023-03-20 18:30:34.463+07	luloek.17060464017@mhs.unesa.ac.id	\N	user	t
112635510579447485439	david romadhona	https://lh3.googleusercontent.com/a/AGNmyxaVQqgqn9VGmyq8pqxVKrqRDIdEqVaEG5iF_XqvNg=s96-c	\N	112635510579447485439	USER	GOOGLE		1970-01-01	2023-03-22 09:39:26.852+07	romadhonadavid10@gmail.com	\N	user	t
104505026630112435202	Siti Aminah	https://lh3.googleusercontent.com/a/AGNmyxZr46p1I79d6JZKMyOphFhzg7utDcyOczF0NRXR=s96-c	\N	104505026630112435202	USER	GOOGLE		1970-01-01	2023-03-20 23:23:54.891+07	siti.aminahamien@gmail.com	\N	user	t
114071498507663116224	Bima Alvein	https://lh3.googleusercontent.com/a/AGNmyxbi1EZmp148OIsfERp2X1c7Fbsxe8mpzrvAA9EH=s96-c	\N	114071498507663116224	USER	GOOGLE		1970-01-01	2023-03-27 09:37:39.66+07	bimaalvein@gmail.com	\N	user	t
108534841868218569846	Muhammad Mirzaq Syahrial Alafi	https://lh3.googleusercontent.com/a/AGNmyxatxDX82KjhvmtHFS6Ut_vUiVHC2KxvsNZ7Qxry8g=s96-c	\N	108534841868218569846	USER	GOOGLE		1970-01-01	2023-03-26 21:32:56.648+07	inimirza@gmail.com	\N	user	t
103247940974287473780	Irma Kurniasari	https://lh3.googleusercontent.com/a/AGNmyxadJR3rpwHq6q5CWpA5uGGtw8cNnOC_7G6o6fiqXA=s96-c	\N	103247940974287473780	USER	GOOGLE		1970-01-01	2023-03-21 02:17:29.963+07	kurniasari.irma@gmail.com	\N	user	t
115382242955323579661	muhammad mahfud	https://lh3.googleusercontent.com/a/AGNmyxblrqt1gqkq41EuLPyS6V0sh4mPE5BBwxVQSCpJ=s96-c	\N	115382242955323579661	USER	GOOGLE		1970-01-01	2023-03-27 14:15:58.579+07	arjet88.mahfud@gmail.com	\N	user	t
114189413630166937544	Agtisda Tiofanna Silalahi	https://lh3.googleusercontent.com/a/AGNmyxZi6lMImJOLNSo9_f9WfyMyGZOE0Q43szEdq8fv=s96-c	\N	114189413630166937544	USER	GOOGLE		1970-01-01	2023-03-21 09:07:38.735+07	agtisdasilalahi18@guru.smk.belajar.id	\N	user	t
115682166007998326595	biant. inspektorat	https://lh3.googleusercontent.com/a/AGNmyxY5S7FmboOfq3d9_2fg7W7UHViW3342UQaDrfXx=s96-c	\N	115682166007998326595	USER	GOOGLE		1970-01-01	2023-03-21 14:31:35.798+07	biant.inspektorat@gmail.com	\N	user	t
101378013871456738749	UPT PPD Malang selatan Official	https://lh3.googleusercontent.com/a/AGNmyxZGVnBbNko0ZpjYY9bxnr8ZnOmAxm4qrS95mg9X=s96-c	\N	101378013871456738749	USER	GOOGLE		1970-01-01	2023-03-21 16:01:41.757+07	uptppdmalsel.official@gmail.com	\N	user	t
115330442806416686479	safiudin udin	https://lh3.googleusercontent.com/a/AGNmyxbvxvECtj6QESiwfQZE7Tu0U6qX8rTzfIKiUeac=s96-c	\N	115330442806416686479	USER	GOOGLE		1970-01-01	2023-03-21 17:31:51.179+07	safiudinnudin@gmail.com	\N	user	t
107413793584390395992	Zul Fahmi	https://lh3.googleusercontent.com/a/AGNmyxYdAYSbmZeKQ9fYIJq1I2kPN47Y-Iaobz1OQXqWCg=s96-c	\N	107413793584390395992	USER	GOOGLE		1970-01-01	2023-03-23 12:48:21.127+07	zulfahmmy@gmail.com	\N	user	t
108629014816953516277	FEBRAR HELMI Ghani	https://lh3.googleusercontent.com/a/AGNmyxYqXsDWiH0eD7Pz-i-9a3plh-1QTDQ_PF4Kh_hlxQ=s96-c	\N	108629014816953516277	USER	GOOGLE		1970-01-01	2023-03-21 18:25:42.725+07	febrarhage@gmail.com	\N	user	t
114245300003263184886	heri sarjono	https://lh3.googleusercontent.com/a/AGNmyxbMi-pIBX7z82lkU4ULnTxhN7wvLnyM9l4TKUj4Xw=s96-c	\N	114245300003263184886	USER	GOOGLE		1970-01-01	2023-03-21 19:09:35.842+07	herissmkn2ngawi@gmail.com	\N	user	t
master|57795	DHINI MARLIYANTI S.Pd.	https://master.bkd.jatimprov.go.id/files_jatimprov/57795-file_foto-20190706-858-29_-_Copy.jpg	57795	master	USER	MASTER	199411192019032013	1994-11-19	2023-03-21 19:55:08.284+07	marliyantid@gmail.com	10537100302	user	t
115357228798140971057	Haris Murdiono	https://lh3.googleusercontent.com/a/AGNmyxbXiAv7Jg_hq5gi2kTSTv63QJXkJtvCaZuOnwAlFg=s96-c	\N	115357228798140971057	USER	GOOGLE		1970-01-01	2023-03-22 06:11:33.375+07	haris.murdiono.hartono@gmail.com	\N	user	t
117172305789823713345	masya 65	https://lh3.googleusercontent.com/a/AGNmyxbGpJAQPexSuMTz6aEOy4oArA7sd_xUBwgQkBWXxw=s96-c	\N	117172305789823713345	USER	GOOGLE		1970-01-01	2023-03-23 14:36:47.809+07	masyantsugianto0365@gmail.com	\N	user	t
master|58235	SIDI MUHAMMAD MUADZ DZIN ASIS HAWAYA S.Pd.	https://master.bkd.jatimprov.go.id/files_jatimprov/58235-file_foto-20190816-443-Untitled.jpg	58235	master	USER	MASTER	199304122019031010	1993-04-12	2023-03-23 14:39:01.44+07	sidmuhammad9@gmail.com	10535101602	user	t
master|60346	MUHAMMAD MAHFUD S.Sos	https://master.bkd.jatimprov.go.id/files_jatimprov/60346-file_foto-20210216-276-IMG_20210216_001546.jpg	60346	master	USER	MASTER	198803032020121022	1988-03-03	2023-03-24 07:57:54.667+07	arjet88.mahfud@gmail.com	1510302	user	f
master|33634	SARI KUSUMOWATI S.Pt	https://master.bkd.jatimprov.go.id/files_jatimprov/33634-file_foto-20200908-761-33634-file_foto-20170125-883-sari_23guru_smk_1_copy.jpg	33634	master	USER	MASTER	197803162009042003	1978-03-16	2023-03-26 10:53:01.987+07	sharisandesu@yahoo.co.id	10538101702	user	t
106792856836077357019	BUDIONO BUDIONO	https://lh3.googleusercontent.com/a/AGNmyxYeWGf6VII-Tgccuk01Z4ZUSjHZldvrk-0jqfES=s96-c	\N	106792856836077357019	USER	GOOGLE		1970-01-01	2023-03-24 20:18:23.766+07	alfamia82@gmail.com	\N	user	t
111539702573555436705	ahmad misbah	https://lh3.googleusercontent.com/a/AGNmyxbuDGY4nMMUrmFH8Ql2fFVoDaeCr5IIZy6AsVjv=s96-c	\N	111539702573555436705	USER	GOOGLE		1970-01-01	2023-03-25 21:55:00.001+07	ahmadmisbah3399@gmail.com	\N	user	t
110284786744654385207	ely setyani	https://lh3.googleusercontent.com/a/AGNmyxbpCEMEkfJORTwiFFb9lw7fnm3VQgjYGSkhn4-QLA=s96-c	\N	110284786744654385207	USER	GOOGLE		1970-01-01	2023-03-24 06:03:51.918+07	elysetyani6@gmail.com	\N	user	t
102069256976145361753	Bid PE Bakorwil Jember	https://lh3.googleusercontent.com/a/AGNmyxbC2dy3Gtn8nAUC84ND381sqiqkS_K1BIzlmb9V=s96-c	\N	102069256976145361753	USER	GOOGLE		1970-01-01	2023-03-24 07:52:23.744+07	bidpebakorwilvjember@gmail.com	\N	user	t
110695046821305797010	Rusmawanto	https://lh3.googleusercontent.com/a/AGNmyxY3LhsMVZ4pBtrtOsAvjnzzLf4pe448rq_lBuHq2g=s96-c	\N	110695046821305797010	USER	GOOGLE		1970-01-01	2023-03-24 13:18:53.266+07	rusmawanto49@gmail.com	\N	user	t
118307335638196293112	ary sujatmiko	https://lh3.googleusercontent.com/a/AGNmyxbY1s74vOy-qDdeuKWho1qDU4txLgmY1MZgxlrU=s96-c	\N	118307335638196293112	USER	GOOGLE		1970-01-01	2023-03-25 06:43:53.514+07	ary.sujatmiko80@gmail.com	\N	user	t
111375786144905284420	drive rony	https://lh3.googleusercontent.com/a/AGNmyxZDX9nbySq3YTNh2eFQVxKmMGQTwph4MwZVQzNY=s96-c	\N	111375786144905284420	USER	GOOGLE		1970-01-01	2023-03-24 22:36:40.833+07	driveronypld@gmail.com	\N	user	t
pttpk|328	KOIRUL ABDUL MUKIT	https://bkd.jatimprov.go.id/pttpk/upload_foto/32814.jpg	328	pttpk	USER	PTTPK	10220230419941220130328	1994-04-23	2023-03-24 08:02:41.376+07	koirulmukit@gmail.com	1031801	user	t
pttpk|12166	ERIK ARVINSDO FERDIAN EFFENDY, A.Md.	https://bkd.jatimprov.go.id/pttpk/upload_foto/3473Erik_Arvindo.JPG	12166	pttpk	USER	PTTPK	124090219830420222578	1983-02-09	2023-03-24 07:44:31.979+07	erikarvindo@gmail.com	121	user	f
master|56548	NOVAN ARIANSYAH S.Kom	https://master.bkd.jatimprov.go.id/files_jatimprov/56548-file_foto-20190720-310-DSC_0441.JPG	56548	master	USER	MASTER	199211062019031012	1992-11-06	2023-03-27 09:14:22.074+07	novanari6@gmail.com	12304	admin	t
master|71620	BAYU PANDU WIBISONO S.Kom	https://master.bkd.jatimprov.go.id/files_jatimprov/71620-file_foto-20230203-770-bayu_setengah_compres.jpeg	71620	master	USER	MASTER	198410012010011012	1984-10-01	2023-03-24 13:53:33.571+07	bayupanduwibisono@gmail.com	105341024	user	t
103059080006583136498	Ridho Zaza	https://lh3.googleusercontent.com/a/AGNmyxYGn6iwY_Sc24u3xjt2k_JoNw6WWQqjY7WbGEfz=s96-c	\N	103059080006583136498	USER	GOOGLE		1970-01-01	2023-03-27 13:04:55.319+07	ridhozaza85@gmail.com	\N	user	t
112263634041057016989	Jefry I W Gusti (Jepp)	https://lh3.googleusercontent.com/a/AGNmyxYykaWo4QaHpijTmGaGGkU27q7rIhRpQAScDYUfvQ=s96-c	\N	112263634041057016989	USER	GOOGLE		1970-01-01	2023-03-25 12:49:28.654+07	jefrydivan13@gmail.com	\N	user	t
116731181687073188350	Arif Ifa	https://lh3.googleusercontent.com/a/AGNmyxbz5d34PCHrBXhUJKcxC8MM2zsiOoc1Norrimrd=s96-c	\N	116731181687073188350	USER	GOOGLE		1970-01-01	2023-03-25 06:56:42.672+07	arififa26@gmail.com	\N	user	t
103607405887123196492	Agus Subianto	https://lh3.googleusercontent.com/a/AGNmyxaLHMekSOWQLMeCnfrnpGmLDg-pjG79W9pfRmHP=s96-c	\N	103607405887123196492	USER	GOOGLE		1970-01-01	2023-03-26 20:14:17.148+07	agussubianto404@gmail.com	\N	user	t
master|56543	IPUT TAUFIQURROHMAN SUWARTO S.Kom	https://master.bkd.jatimprov.go.id/files_jatimprov/56543-file_foto-20190720-969-DSC_0443.JPG	56543	master	USER	MASTER	199103052019031008	1991-03-05	2023-03-27 20:41:58.866+07	taufiqurrohman.suwarto@gmail.com	12302	admin	f
100924312039026485175	Fitria Ambarwati	https://lh3.googleusercontent.com/a/AGNmyxbXcgaQedon5juv-RBWVUK92WYKPy-e_NpdTm28=s96-c	\N	100924312039026485175	USER	GOOGLE		1970-01-01	2023-03-26 10:10:02.52+07	fitriaambarwati66@guru.sd.belajar.id	\N	user	t
101182176522172754394	Agung Putro	https://lh3.googleusercontent.com/a/AGNmyxaTRi9l4gML3oOrMt4ei9gtCsLigUcoO8s34eg0=s96-c	\N	101182176522172754394	USER	GOOGLE		1970-01-01	2023-03-26 13:12:21.583+07	agung03nongo@gmail.com	\N	user	t
pttpk|5920074	FERDIAN CHANDRA MAULANA, S.I.Kom.	https://bkd.jatimprov.go.id/pttpk/upload_foto/59200745039ECDE-BECD-4089-89C7-17BBE5BED70B.jpeg	5920074	pttpk	USER	PTTPK	118150620000120235613	2000-06-15	2023-03-26 15:03:26.387+07	ferdimaulana353@gmail.com	1090101	user	t
master|57783	YULIA AGUSTINA S.Pd.	https://master.bkd.jatimprov.go.id/files_jatimprov/57783-file_foto-20200514-224-IMG-20190509-WA0007.jpg	57783	master	USER	MASTER	199108042019032015	1991-08-04	2023-03-26 22:15:37.83+07	agustina.ya16@gmail.com	10535100502	user	t
104023354588384349990	Ahmad Fahruddin	https://lh3.googleusercontent.com/a/AGNmyxaAajGMS5WkOHTcLjThA6Id1vO5dvSuPT2J1w1c=s96-c	\N	104023354588384349990	USER	GOOGLE		1970-01-01	2023-03-27 02:59:26.09+07	ahmadfahruddin82@guru.smp.belajar.id	\N	user	f
105255692806410593079	ariantopujo 71	https://lh3.googleusercontent.com/a/AGNmyxaf6YJTBCMkba4PnWxb2eAQtZF3l8r-rTRRK_-D=s96-c	\N	105255692806410593079	USER	GOOGLE		1970-01-01	2023-03-27 10:13:32.295+07	ariantopujo71@gmail.com	\N	user	t
100192051218683320473	Bayu Ratkaret	https://lh3.googleusercontent.com/a/AGNmyxa32pcteiV6jbZOFLGucC3ZJ1ctild60yHYAPEF=s96-c	\N	100192051218683320473	USER	GOOGLE		1970-01-01	2023-03-27 11:00:53.078+07	bayuratkaret@gmail.com	\N	user	t
101885154366811277091	pujo arianto	https://lh3.googleusercontent.com/a/AGNmyxZYU_u-91l33Cw85jkq2jN8cTj5ZYxRJHkZa5mp=s96-c	\N	101885154366811277091	USER	GOOGLE		1970-01-01	2023-03-27 12:22:43.544+07	ariantopujo42@gmail.com	\N	user	t
106583115163591403609	ikhwan aryk	https://lh3.googleusercontent.com/a/AGNmyxadOmGbxQ9wHPud9CvGZtIkogaKglQ5-8za6M9P=s96-c	\N	106583115163591403609	USER	GOOGLE		1970-01-01	2023-03-27 13:10:08.536+07	ikhwan.aryk1976@gmail.com	\N	user	t
107051605676847651248	Tjandra Yani	https://lh3.googleusercontent.com/a/AGNmyxbQmmpr3OHJeq9e7Jw9Cm1LfYGMbaNzJNAvG8Pv=s96-c	\N	107051605676847651248	USER	GOOGLE		1970-01-01	2023-03-27 15:10:38.134+07	azkatjandrayani@gmail.com	\N	user	t
113485912083596928306	Riastiti Saputri	https://lh3.googleusercontent.com/a/AGNmyxZ9IgsAgokGOdkjQ78Lr3qT3_ssaUf2HLNbWwMf_g=s96-c	\N	113485912083596928306	USER	GOOGLE		1970-01-01	2023-03-27 18:47:52.377+07	riastitisaputri@gmail.com	\N	user	t
\.


--
-- Data for Name: users_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users_permissions (id, role_id, permission_id, created_at) FROM stdin;
\.


--
-- Name: activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.activities_id_seq', 1, false);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 27, true);


--
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comments_id_seq', 9, true);


--
-- Name: faqs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.faqs_id_seq', 24, true);


--
-- Name: knex_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.knex_migrations_id_seq', 65, true);


--
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.knex_migrations_lock_index_seq', 3, true);


--
-- Name: mentions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mentions_id_seq', 1, false);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 662, true);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permissions_id_seq', 2, false);


--
-- Name: saved_replies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.saved_replies_id_seq', 1, false);


--
-- Name: sub_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sub_categories_id_seq', 14, true);


--
-- Name: sub_faqs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sub_faqs_id_seq', 11, true);


--
-- Name: ticket_status_histories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ticket_status_histories_id_seq', 1, false);


--
-- Name: tickets_comments_customers_agents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tickets_comments_customers_agents_id_seq', 164, true);


--
-- Name: users_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_permissions_id_seq', 2, false);


--
-- Name: users_reactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_reactions_id_seq', 1, false);


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: comments_reactions comments-reactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments_reactions
    ADD CONSTRAINT "comments-reactions_pkey" PRIMARY KEY (comment_id, user_id, reaction);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: faqs faqs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT faqs_pkey PRIMARY KEY (id);


--
-- Name: knex_migrations_lock knex_migrations_lock_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knex_migrations_lock
    ADD CONSTRAINT knex_migrations_lock_pkey PRIMARY KEY (index);


--
-- Name: knex_migrations knex_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knex_migrations
    ADD CONSTRAINT knex_migrations_pkey PRIMARY KEY (id);


--
-- Name: mentions mentions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mentions
    ADD CONSTRAINT mentions_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: priorities priorities_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.priorities
    ADD CONSTRAINT priorities_pk PRIMARY KEY (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (name);


--
-- Name: saved_replies saved_replies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_replies
    ADD CONSTRAINT saved_replies_pkey PRIMARY KEY (id);


--
-- Name: status status_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.status
    ADD CONSTRAINT status_pkey PRIMARY KEY (name);


--
-- Name: sub_categories sub_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_categories
    ADD CONSTRAINT sub_categories_pkey PRIMARY KEY (id);


--
-- Name: sub_faqs sub_faqs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_faqs
    ADD CONSTRAINT sub_faqs_pkey PRIMARY KEY (id);


--
-- Name: tickets_subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets_subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (user_id, ticket_id);


--
-- Name: tickets_histories ticket_status_histories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets_histories
    ADD CONSTRAINT ticket_status_histories_pkey PRIMARY KEY (id);


--
-- Name: tickets_agents_helper tickets_agents_helper_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets_agents_helper
    ADD CONSTRAINT tickets_agents_helper_pkey PRIMARY KEY (user_custom_id, ticket_id);


--
-- Name: tickets_attachments tickets_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets_attachments
    ADD CONSTRAINT tickets_attachments_pkey PRIMARY KEY (id);


--
-- Name: tickets_comments_customers tickets_comments_customers_agents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets_comments_customers
    ADD CONSTRAINT tickets_comments_customers_agents_pkey PRIMARY KEY (id);


--
-- Name: tickets_comments_agents tickets_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets_comments_agents
    ADD CONSTRAINT tickets_comments_pkey PRIMARY KEY (id);


--
-- Name: tickets_labels tickets_labels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets_labels
    ADD CONSTRAINT tickets_labels_pkey PRIMARY KEY (ticket_id, label);


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- Name: users_permissions users_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_permissions
    ADD CONSTRAINT users_permissions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (custom_id);


--
-- Name: tickets_reactions users_reactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets_reactions
    ADD CONSTRAINT users_reactions_pkey PRIMARY KEY (id);


--
-- Name: activities activities_receiver_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_receiver_foreign FOREIGN KEY (receiver) REFERENCES public.users(custom_id);


--
-- Name: activities activities_sender_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_sender_foreign FOREIGN KEY (sender) REFERENCES public.users(custom_id);


--
-- Name: activities activities_ticket_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_ticket_id_foreign FOREIGN KEY (ticket_id) REFERENCES public.tickets(id);


--
-- Name: categories categories_created_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_created_by_foreign FOREIGN KEY (created_by) REFERENCES public.users(custom_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: categories categories_updated_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_updated_by_foreign FOREIGN KEY (updated_by) REFERENCES public.users(custom_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comments comments_comment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_comment_id_foreign FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comments comments_user_custom_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_custom_id_foreign FOREIGN KEY (user_custom_id) REFERENCES public.users(custom_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: faqs faqs_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT faqs_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(custom_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: mentions mentions_mention_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mentions
    ADD CONSTRAINT mentions_mention_by_foreign FOREIGN KEY (mention_by) REFERENCES public.users(custom_id);


--
-- Name: mentions mentions_ticket_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mentions
    ADD CONSTRAINT mentions_ticket_id_foreign FOREIGN KEY (ticket_id) REFERENCES public.tickets(id);


--
-- Name: mentions mentions_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mentions
    ADD CONSTRAINT mentions_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(custom_id);


--
-- Name: notifications notifications_from_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_from_foreign FOREIGN KEY ("from") REFERENCES public.users(custom_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_ticket_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_ticket_id_foreign FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_to_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_to_foreign FOREIGN KEY ("to") REFERENCES public.users(custom_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: priorities priorities_created_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.priorities
    ADD CONSTRAINT priorities_created_by_foreign FOREIGN KEY (created_by) REFERENCES public.users(custom_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: saved_replies saved_replies_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_replies
    ADD CONSTRAINT saved_replies_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(custom_id);


--
-- Name: status status_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.status
    ADD CONSTRAINT status_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(custom_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sub_categories sub_categories_category_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_categories
    ADD CONSTRAINT sub_categories_category_id_foreign FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sub_categories sub_categories_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_categories
    ADD CONSTRAINT sub_categories_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(custom_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sub_faqs sub_faqs_faq_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_faqs
    ADD CONSTRAINT sub_faqs_faq_id_fkey FOREIGN KEY (faq_id) REFERENCES public.faqs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sub_faqs sub_faqs_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_faqs
    ADD CONSTRAINT sub_faqs_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(custom_id) ON DELETE CASCADE;


--
-- Name: tickets_subscriptions subscriptions_ticket_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets_subscriptions
    ADD CONSTRAINT subscriptions_ticket_id_foreign FOREIGN KEY (ticket_id) REFERENCES public.tickets(id);


--
-- Name: tickets_subscriptions subscriptions_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets_subscriptions
    ADD CONSTRAINT subscriptions_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(custom_id);


--
-- Name: tickets_histories ticket_status_histories_ticket_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets_histories
    ADD CONSTRAINT ticket_status_histories_ticket_id_foreign FOREIGN KEY (ticket_id) REFERENCES public.tickets(id);


--
-- Name: tickets_histories ticket_status_histories_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets_histories
    ADD CONSTRAINT ticket_status_histories_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(custom_id);


--
-- Name: tickets_agents_helper tickets_agents_helper_ticket_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets_agents_helper
    ADD CONSTRAINT tickets_agents_helper_ticket_id_foreign FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tickets_agents_helper tickets_agents_helper_user_custom_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets_agents_helper
    ADD CONSTRAINT tickets_agents_helper_user_custom_id_foreign FOREIGN KEY (user_custom_id) REFERENCES public.users(custom_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tickets_attachments tickets_attachments_ticket_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets_attachments
    ADD CONSTRAINT tickets_attachments_ticket_id_foreign FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tickets tickets_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tickets_comments_customers tickets_comments_customers_agents_ticket_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets_comments_customers
    ADD CONSTRAINT tickets_comments_customers_agents_ticket_id_foreign FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tickets_comments_customers tickets_comments_customers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets_comments_customers
    ADD CONSTRAINT tickets_comments_customers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(custom_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tickets_comments_agents tickets_comments_ticket_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets_comments_agents
    ADD CONSTRAINT tickets_comments_ticket_id_foreign FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tickets_labels tickets_labels_ticket_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets_labels
    ADD CONSTRAINT tickets_labels_ticket_id_foreign FOREIGN KEY (ticket_id) REFERENCES public.tickets(id);


--
-- Name: tickets tickets_priority_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_priority_code_fkey FOREIGN KEY (priority_code) REFERENCES public.priorities(name) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tickets tickets_status_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_status_code_fkey FOREIGN KEY (status_code) REFERENCES public.status(name) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tickets tickets_sub_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_sub_category_id_fkey FOREIGN KEY (sub_category_id) REFERENCES public.sub_categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_current_role_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_current_role_foreign FOREIGN KEY ("current_role") REFERENCES public.roles(name) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users_permissions users_permissions_permission_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_permissions
    ADD CONSTRAINT users_permissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users_permissions users_permissions_role_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_permissions
    ADD CONSTRAINT users_permissions_role_id_foreign FOREIGN KEY (role_id) REFERENCES public.roles(name) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tickets_reactions users_reactions_ticket_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets_reactions
    ADD CONSTRAINT users_reactions_ticket_id_foreign FOREIGN KEY (ticket_id) REFERENCES public.tickets(id);


--
-- Name: tickets_reactions users_reactions_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets_reactions
    ADD CONSTRAINT users_reactions_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(custom_id);


--
-- PostgreSQL database dump complete
--

