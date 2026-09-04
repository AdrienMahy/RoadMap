--
-- PostgreSQL database dump
--

\restrict veXQAqls7hlix00ZbxR1yLs8WQr0baw8rieN4HAqrtdcT2zcm59Rdi3uLCDWXjd

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

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

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: roadmap
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO roadmap;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: roadmap
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO roadmap;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: roadmap
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNER TO roadmap;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: roadmap
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: _init_status; Type: TABLE; Schema: public; Owner: roadmap
--

CREATE TABLE public._init_status (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    status text DEFAULT 'initialized'::text,
    note text
);


ALTER TABLE public._init_status OWNER TO roadmap;

--
-- Name: _init_status_id_seq; Type: SEQUENCE; Schema: public; Owner: roadmap
--

CREATE SEQUENCE public._init_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public._init_status_id_seq OWNER TO roadmap;

--
-- Name: _init_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: roadmap
--

ALTER SEQUENCE public._init_status_id_seq OWNED BY public._init_status.id;


--
-- Name: comments; Type: TABLE; Schema: public; Owner: roadmap
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    target_type character varying(50) NOT NULL,
    target_id integer NOT NULL,
    user_id integer NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    parent_comment_id integer
);


ALTER TABLE public.comments OWNER TO roadmap;

--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: roadmap
--

CREATE SEQUENCE public.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comments_id_seq OWNER TO roadmap;

--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: roadmap
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- Name: comments_parent_comment_id_seq; Type: SEQUENCE; Schema: public; Owner: roadmap
--

CREATE SEQUENCE public.comments_parent_comment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comments_parent_comment_id_seq OWNER TO roadmap;

--
-- Name: comments_target_id_seq; Type: SEQUENCE; Schema: public; Owner: roadmap
--

CREATE SEQUENCE public.comments_target_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comments_target_id_seq OWNER TO roadmap;

--
-- Name: comments_target_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: roadmap
--

ALTER SEQUENCE public.comments_target_id_seq OWNED BY public.comments.target_id;


--
-- Name: modules; Type: TABLE; Schema: public; Owner: roadmap
--

CREATE TABLE public.modules (
    id integer NOT NULL,
    project_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    status character varying(50) DEFAULT 'planned'::character varying NOT NULL,
    icon character varying(50),
    priority character varying(20) DEFAULT 'medium'::character varying NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.modules OWNER TO roadmap;

--
-- Name: modules_id_seq; Type: SEQUENCE; Schema: public; Owner: roadmap
--

CREATE SEQUENCE public.modules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.modules_id_seq OWNER TO roadmap;

--
-- Name: modules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: roadmap
--

ALTER SEQUENCE public.modules_id_seq OWNED BY public.modules.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: roadmap
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    type character varying(50) NOT NULL,
    target_type character varying(50),
    target_id integer,
    related_user_id integer,
    message character varying(255) NOT NULL,
    read boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    project_id integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.notifications OWNER TO roadmap;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: roadmap
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO roadmap;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: roadmap
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: points; Type: TABLE; Schema: public; Owner: roadmap
--

CREATE TABLE public.points (
    id integer NOT NULL,
    stage_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    completed boolean DEFAULT false NOT NULL,
    priority character varying(20) DEFAULT 'medium'::character varying NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    completed_at timestamp without time zone
);


ALTER TABLE public.points OWNER TO roadmap;

--
-- Name: points_id_seq; Type: SEQUENCE; Schema: public; Owner: roadmap
--

CREATE SEQUENCE public.points_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.points_id_seq OWNER TO roadmap;

--
-- Name: points_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: roadmap
--

ALTER SEQUENCE public.points_id_seq OWNED BY public.points.id;


--
-- Name: points_stage_id_seq; Type: SEQUENCE; Schema: public; Owner: roadmap
--

CREATE SEQUENCE public.points_stage_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.points_stage_id_seq OWNER TO roadmap;

--
-- Name: points_stage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: roadmap
--

ALTER SEQUENCE public.points_stage_id_seq OWNED BY public.points.stage_id;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: roadmap
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    status character varying(50) DEFAULT 'planned'::character varying NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.projects OWNER TO roadmap;

--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: roadmap
--

CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.projects_id_seq OWNER TO roadmap;

--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: roadmap
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- Name: stages; Type: TABLE; Schema: public; Owner: roadmap
--

CREATE TABLE public.stages (
    id integer NOT NULL,
    module_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    delivery_date date,
    icon character varying(50),
    priority character varying(20) DEFAULT 'medium'::character varying NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    validated_at timestamp without time zone,
    project_id integer
);


ALTER TABLE public.stages OWNER TO roadmap;

--
-- Name: stages_id_seq; Type: SEQUENCE; Schema: public; Owner: roadmap
--

CREATE SEQUENCE public.stages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stages_id_seq OWNER TO roadmap;

--
-- Name: stages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: roadmap
--

ALTER SEQUENCE public.stages_id_seq OWNED BY public.stages.id;


--
-- Name: stages_project_id_seq; Type: SEQUENCE; Schema: public; Owner: roadmap
--

CREATE SEQUENCE public.stages_project_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stages_project_id_seq OWNER TO roadmap;

--
-- Name: update_history; Type: TABLE; Schema: public; Owner: roadmap
--

CREATE TABLE public.update_history (
    id integer NOT NULL,
    target_type character varying(50) NOT NULL,
    target_id integer NOT NULL,
    action character varying(100) NOT NULL,
    old_value text,
    new_value text,
    changed_by character varying(255) DEFAULT 'system'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.update_history OWNER TO roadmap;

--
-- Name: update_history_id_seq; Type: SEQUENCE; Schema: public; Owner: roadmap
--

CREATE SEQUENCE public.update_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.update_history_id_seq OWNER TO roadmap;

--
-- Name: update_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: roadmap
--

ALTER SEQUENCE public.update_history_id_seq OWNED BY public.update_history.id;


--
-- Name: update_history_target_id_seq; Type: SEQUENCE; Schema: public; Owner: roadmap
--

CREATE SEQUENCE public.update_history_target_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.update_history_target_id_seq OWNER TO roadmap;

--
-- Name: update_history_target_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: roadmap
--

ALTER SEQUENCE public.update_history_target_id_seq OWNED BY public.update_history.target_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: roadmap
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    email character varying(255),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    first_name character varying(255),
    last_name character varying(255),
    role character varying(50) DEFAULT 'Board'::character varying NOT NULL
);


ALTER TABLE public.users OWNER TO roadmap;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: roadmap
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO roadmap;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: roadmap
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: roadmap
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: _init_status id; Type: DEFAULT; Schema: public; Owner: roadmap
--

ALTER TABLE ONLY public._init_status ALTER COLUMN id SET DEFAULT nextval('public._init_status_id_seq'::regclass);


--
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: roadmap
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: comments target_id; Type: DEFAULT; Schema: public; Owner: roadmap
--

ALTER TABLE ONLY public.comments ALTER COLUMN target_id SET DEFAULT nextval('public.comments_target_id_seq'::regclass);


--
-- Name: modules id; Type: DEFAULT; Schema: public; Owner: roadmap
--

ALTER TABLE ONLY public.modules ALTER COLUMN id SET DEFAULT nextval('public.modules_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: roadmap
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: points id; Type: DEFAULT; Schema: public; Owner: roadmap
--

ALTER TABLE ONLY public.points ALTER COLUMN id SET DEFAULT nextval('public.points_id_seq'::regclass);


--
-- Name: points stage_id; Type: DEFAULT; Schema: public; Owner: roadmap
--

ALTER TABLE ONLY public.points ALTER COLUMN stage_id SET DEFAULT nextval('public.points_stage_id_seq'::regclass);


--
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: roadmap
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- Name: stages id; Type: DEFAULT; Schema: public; Owner: roadmap
--

ALTER TABLE ONLY public.stages ALTER COLUMN id SET DEFAULT nextval('public.stages_id_seq'::regclass);


--
-- Name: update_history id; Type: DEFAULT; Schema: public; Owner: roadmap
--

ALTER TABLE ONLY public.update_history ALTER COLUMN id SET DEFAULT nextval('public.update_history_id_seq'::regclass);


--
-- Name: update_history target_id; Type: DEFAULT; Schema: public; Owner: roadmap
--

ALTER TABLE ONLY public.update_history ALTER COLUMN target_id SET DEFAULT nextval('public.update_history_target_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: roadmap
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: roadmap
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
1	e956f5aa31b524165ee85d5a0e471ac0041bb7561f7d2d8a91bde471d527b2d3	1787843982393
2	5516f124de9a02f0977b19b963afed64ae6a57c46843c91881c19cbeae88a9fd	1787912861099
3	1b8e280dfbb4711d5f3da869a7022163feb1a5ce2cc75de40634f5f0dc63b2b4	1787919856889
4	9123682e8c6c38c7fbdc0be8846fbc18e6deac2e5fb43d0882719cc9c14f6b44	1787920856889
5	f669729869080a9a8b4181df5bc7c66e67a16fd00cc177c31951b1c09f9a3d8c	1787921856889
6	b5e087e92952a5fd142141a8d1c0522da2168eacc4453a1c7e79d2dda18b1e3b	1787922856889
7	c5ec0a748b0782c9a3768454812923177e0b22bd0ee78efd799a288c8b75126d	1787923856889
\.


--
-- Data for Name: _init_status; Type: TABLE DATA; Schema: public; Owner: roadmap
--

COPY public._init_status (id, created_at, status, note) FROM stdin;
1	2026-09-03 10:52:52.487559	initialized	Database ready - schema and data from Drizzle migrations + backup restore
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: roadmap
--

COPY public.comments (id, target_type, target_id, user_id, content, created_at, updated_at, parent_comment_id) FROM stdin;
\.


--
-- Data for Name: modules; Type: TABLE DATA; Schema: public; Owner: roadmap
--

COPY public.modules (id, project_id, name, description, status, icon, priority, order_index, created_at, updated_at) FROM stdin;
1	1	AMS	Système de gestion du suivi des données sportives	planned	\N	medium	1	2026-09-02 15:40:02.847857	2026-09-02 15:40:02.847857
2	1	QuestionnaireApp	Application de gestion des questionnaires	planned	\N	medium	2	2026-09-02 15:40:02.859302	2026-09-02 15:40:02.859302
3	2	Holocron	Plateforme de gestion du contenu média	planned	\N	medium	1	2026-09-02 15:40:02.86067	2026-09-02 15:40:02.86067
4	2	TacticalDisplay	Système d'affichage tactique	planned	\N	medium	2	2026-09-02 15:40:02.861506	2026-09-02 15:40:02.861506
5	2	ControlDisplay	Système de contrôle d'affichage	planned	\N	medium	3	2026-09-02 15:40:02.865043	2026-09-02 15:40:02.865043
6	2	Holonet	Réseau holistique	planned	\N	medium	4	2026-09-02 15:40:02.865903	2026-09-02 15:40:02.865903
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: roadmap
--

COPY public.notifications (id, user_id, type, target_type, target_id, related_user_id, message, read, created_at, project_id) FROM stdin;
\.


--
-- Data for Name: points; Type: TABLE DATA; Schema: public; Owner: roadmap
--

COPY public.points (id, stage_id, name, description, completed, priority, order_index, created_at, updated_at, completed_at) FROM stdin;
1	1	Refonte du système d’association Joueur / Saison pour améliorer le suivi historique des données		f	medium	1	2026-09-02 15:40:02.850354	2026-09-02 15:40:02.850354	\N
2	1	Déploiement sur les réseaux publics pour rendre AMS accessible depuis l’extérieur du réseau interne		f	medium	2	2026-09-02 15:40:02.851228	2026-09-02 15:40:02.851228	\N
3	2	Amélioration du suivi de la réhabilitation : exercices, étapes, rechutes, etc.		f	medium	1	2026-09-02 15:40:02.851995	2026-09-02 15:40:02.851995	\N
4	2	Ajout d’alerteurs de blessure		f	medium	2	2026-09-02 15:40:02.852323	2026-09-02 15:40:02.852323	\N
5	2	Amélioration de la définition du statut du joueur via les questionnaires et/ou les données GPS		f	medium	3	2026-09-02 15:40:02.852632	2026-09-02 15:40:02.852632	\N
6	3	Séparation du module Match du Planning et création d’un module indépendant		f	medium	1	2026-09-02 15:40:02.853438	2026-09-02 15:40:02.853438	\N
7	3	Création d’une section « Retour individuel »		f	medium	2	2026-09-02 15:40:02.8539	2026-09-02 15:40:02.8539	\N
8	3	Création d’une section « Analyse » pour le reporting des prestations des joueurs		f	medium	3	2026-09-02 15:40:02.854221	2026-09-02 15:40:02.854221	\N
9	3	Création du module « Joueurs en prêt »		f	medium	4	2026-09-02 15:40:02.854517	2026-09-02 15:40:02.854517	\N
10	4	Création d’événements hors GPS : musculation, séances individuelles, événements hors football, etc.		f	medium	1	2026-09-02 15:40:02.855213	2026-09-02 15:40:02.855213	\N
11	5	Sortir de la dépendance à Tableau et passer les visuels en React		f	medium	1	2026-09-02 15:40:02.856036	2026-09-02 15:40:02.856036	\N
12	5	Création des différentes analyses pour chaque KPI		f	medium	2	2026-09-02 15:40:02.856336	2026-09-02 15:40:02.856336	\N
13	5	Création d’un module d’exploration des données pour la création de séances ou l’analyse d’un joueur		f	medium	3	2026-09-02 15:40:02.856626	2026-09-02 15:40:02.856626	\N
14	6	Création d’un espace dédié aux joueurs avec accès à leurs propres données		f	medium	1	2026-09-02 15:40:02.8574	2026-09-02 15:40:02.8574	\N
15	6	Accès à un planning individuel en lien avec le module Planning		f	medium	2	2026-09-02 15:40:02.857718	2026-09-02 15:40:02.857718	\N
16	7	Refonte du module pour intégrer les données tactico-techniques de SportsDynamics		f	medium	1	2026-09-02 15:40:02.858407	2026-09-02 15:40:02.858407	\N
17	7	Intégration des données des autres providers		f	medium	2	2026-09-02 15:40:02.858693	2026-09-02 15:40:02.858693	\N
18	7	Création de rapports individualisés		f	medium	3	2026-09-02 15:40:02.858981	2026-09-02 15:40:02.858981	\N
19	8	Migration du service Questionnaire sur le serveur AMS		f	medium	1	2026-09-02 15:40:02.859876	2026-09-02 15:40:02.859876	\N
20	8	Accès aux questionnaires depuis l’interface Joueur		f	medium	2	2026-09-02 15:40:02.860164	2026-09-02 15:40:02.860164	\N
21	9	Création d’un coffre-fort pour les contenus sensibles		f	medium	1	2026-09-02 15:40:02.861224	2026-09-02 15:40:02.861224	\N
22	10	Passage de l’application Desktop à une architecture centralisée sur un serveur dédié		f	medium	1	2026-09-02 15:40:02.862834	2026-09-02 15:40:02.862834	\N
23	10	Évolution vers une application de type VMS		f	medium	2	2026-09-02 15:40:02.863233	2026-09-02 15:40:02.863233	\N
24	10	Centralisation des commandes des caméras		f	medium	3	2026-09-02 15:40:02.863545	2026-09-02 15:40:02.863545	\N
25	10	Centralisation des enregistrements		f	medium	4	2026-09-02 15:40:02.863838	2026-09-02 15:40:02.863838	\N
26	11	Contrôle poussé des télévisions		f	medium	1	2026-09-02 15:40:02.864474	2026-09-02 15:40:02.864474	\N
27	11	Allumage à distance des télévisions		f	medium	2	2026-09-02 15:40:02.86476	2026-09-02 15:40:02.86476	\N
28	12	Programmation de contenus sur les télévisions		f	medium	1	2026-09-02 15:40:02.865596	2026-09-02 15:40:02.865596	\N
29	13	Création d’un espace de stockage personnel et sécurisé pour les utilisateurs		f	medium	1	2026-09-02 15:40:02.866457	2026-09-02 15:40:02.866457	\N
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: roadmap
--

COPY public.projects (id, name, description, status, order_index, created_at, updated_at) FROM stdin;
1	MySDR	Plateforme unifiée pour la gestion du suivi des données sportives et des questionnaires	planned	1	2026-09-02 15:40:02.846804	2026-09-02 15:40:02.846804
2	MediaPlatform	Suite complète de gestion et diffusion des contenus médias et affichages tactiques	planned	2	2026-09-02 15:40:02.860441	2026-09-02 15:40:02.860441
3	Scrapper	Service d'extraction et d'intégration des données	planned	3	2026-09-02 15:40:02.866769	2026-09-02 15:40:02.866769
\.


--
-- Data for Name: stages; Type: TABLE DATA; Schema: public; Owner: roadmap
--

COPY public.stages (id, module_id, name, description, delivery_date, icon, priority, order_index, status, created_at, updated_at, validated_at, project_id) FROM stdin;
1	1	AMS 2.0		\N	\N	medium	1	planned	2026-09-02 15:40:02.848521	2026-09-02 15:40:02.848521	\N	1
2	1	Amélioration du module Medical		\N	\N	medium	2	planned	2026-09-02 15:40:02.851577	2026-09-02 15:40:02.851577	\N	1
3	1	Création du module Match		\N	\N	medium	3	planned	2026-09-02 15:40:02.852946	2026-09-02 15:40:02.852946	\N	1
4	1	Amélioration du module Planning		\N	\N	medium	4	planned	2026-09-02 15:40:02.854804	2026-09-02 15:40:02.854804	\N	1
5	1	Amélioration du module Analyse		\N	\N	medium	5	planned	2026-09-02 15:40:02.85551	2026-09-02 15:40:02.85551	\N	1
6	1	Création du module Player		\N	\N	medium	6	planned	2026-09-02 15:40:02.856915	2026-09-02 15:40:02.856915	\N	1
7	1	Évolution du module Match		\N	\N	medium	7	planned	2026-09-02 15:40:02.858022	2026-09-02 15:40:02.858022	\N	1
8	2	Intégration de QuestionnaireApp		\N	\N	medium	1	planned	2026-09-02 15:40:02.859555	2026-09-02 15:40:02.859555	\N	1
9	3	Sécurisation des contenus		\N	\N	medium	1	planned	2026-09-02 15:40:02.860913	2026-09-02 15:40:02.860913	\N	2
13	3	Coffre-fort personnel		\N	\N	medium	1	planned	2026-09-02 15:40:02.866144	2026-09-02 15:40:02.866144	\N	2
12	3	Programmation des télévisions		\N	\N	medium	1	planned	2026-09-02 15:40:02.865285	2026-09-02 15:40:02.865285	\N	2
10	6	Centralisation VMS		\N	\N	medium	1	planned	2026-09-02 15:40:02.8621	2026-09-02 15:40:02.8621	\N	2
11	3	Contrôle avancé des télévisions		\N	\N	medium	2	planned	2026-09-02 15:40:02.864118	2026-09-02 15:40:02.864118	\N	2
\.


--
-- Data for Name: update_history; Type: TABLE DATA; Schema: public; Owner: roadmap
--

COPY public.update_history (id, target_type, target_id, action, old_value, new_value, changed_by, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: roadmap
--

COPY public.users (id, username, password, email, created_at, updated_at, first_name, last_name, role) FROM stdin;
1	admin	2b55aa8fdf331a9618b51453f6c3ed93:ff1d13cf938cedf643f6005fe22caa62ce529de1f6111aba4440471a4c71ca650e8e27af3ca7d3c1d0a922fd2c92e6ee706656b1ffb7eb9e1c5b6ab200d18d2a	admin@roadmap.local	2026-09-02 14:29:31.555697	2026-09-02 14:29:31.555697	Admin	System	Administrateur
2	a.mahy	ae1f588f1e456f9640f5bdef37615eb9:9b09e88dffde65701ffd59283d35890d2c6deb8b1750eefd06b28606a96c0b3ebf9e329f52e3439c10bc96bf3ee93840df7156b5b88af6d2ccd582fb2922f7e7	a.mahy@stade-de-reims.com	2026-09-03 14:30:39.934069	2026-09-03 14:30:39.934069	Adrien	Mahy	Administrateur
3	b.luce	7318832837a2987a83561fd0dfec094b:4a73a7e9b6dc154c663ec2973007c0d382d88c56125e876905812d42e08d2dd65f06a5336aed3953d45f717189dbe728ca30792bef55273498856bc6460b5c80	b.luce@stade-de-reims.com	2026-09-03 14:32:03.330719	2026-09-03 14:32:03.330719	Boris	Luce	Board
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: roadmap
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 7, true);


--
-- Name: _init_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: roadmap
--

SELECT pg_catalog.setval('public._init_status_id_seq', 1, true);


--
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: roadmap
--

SELECT pg_catalog.setval('public.comments_id_seq', 1, false);


--
-- Name: comments_parent_comment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: roadmap
--

SELECT pg_catalog.setval('public.comments_parent_comment_id_seq', 1, false);


--
-- Name: comments_target_id_seq; Type: SEQUENCE SET; Schema: public; Owner: roadmap
--

SELECT pg_catalog.setval('public.comments_target_id_seq', 1, false);


--
-- Name: modules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: roadmap
--

SELECT pg_catalog.setval('public.modules_id_seq', 1, false);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: roadmap
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: points_id_seq; Type: SEQUENCE SET; Schema: public; Owner: roadmap
--

SELECT pg_catalog.setval('public.points_id_seq', 32, true);


--
-- Name: points_stage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: roadmap
--

SELECT pg_catalog.setval('public.points_stage_id_seq', 1, false);


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: roadmap
--

SELECT pg_catalog.setval('public.projects_id_seq', 1, false);


--
-- Name: stages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: roadmap
--

SELECT pg_catalog.setval('public.stages_id_seq', 1, false);


--
-- Name: stages_project_id_seq; Type: SEQUENCE SET; Schema: public; Owner: roadmap
--

SELECT pg_catalog.setval('public.stages_project_id_seq', 1, false);


--
-- Name: update_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: roadmap
--

SELECT pg_catalog.setval('public.update_history_id_seq', 1, false);


--
-- Name: update_history_target_id_seq; Type: SEQUENCE SET; Schema: public; Owner: roadmap
--

SELECT pg_catalog.setval('public.update_history_target_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: roadmap
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: roadmap
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: _init_status _init_status_pkey; Type: CONSTRAINT; Schema: public; Owner: roadmap
--

ALTER TABLE ONLY public._init_status
    ADD CONSTRAINT _init_status_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: roadmap
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: public; Owner: roadmap
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: roadmap
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: points points_pkey; Type: CONSTRAINT; Schema: public; Owner: roadmap
--

ALTER TABLE ONLY public.points
    ADD CONSTRAINT points_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: roadmap
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: stages stages_pkey; Type: CONSTRAINT; Schema: public; Owner: roadmap
--

ALTER TABLE ONLY public.stages
    ADD CONSTRAINT stages_pkey PRIMARY KEY (id);


--
-- Name: update_history update_history_pkey; Type: CONSTRAINT; Schema: public; Owner: roadmap
--

ALTER TABLE ONLY public.update_history
    ADD CONSTRAINT update_history_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: roadmap
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: roadmap
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: idx_comments_target; Type: INDEX; Schema: public; Owner: roadmap
--

CREATE INDEX idx_comments_target ON public.comments USING btree (target_type, target_id);


--
-- Name: idx_points_stage_id; Type: INDEX; Schema: public; Owner: roadmap
--

CREATE INDEX idx_points_stage_id ON public.points USING btree (stage_id);


--
-- Name: idx_update_history_target; Type: INDEX; Schema: public; Owner: roadmap
--

CREATE INDEX idx_update_history_target ON public.update_history USING btree (target_type, target_id);


--
-- Name: comments comments_parent_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: roadmap
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_parent_comment_id_fkey FOREIGN KEY (parent_comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- Name: stages stages_module_id_modules_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: roadmap
--

ALTER TABLE ONLY public.stages
    ADD CONSTRAINT stages_module_id_modules_id_fk FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE CASCADE;


--
-- Name: stages stages_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: roadmap
--

ALTER TABLE ONLY public.stages
    ADD CONSTRAINT stages_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict veXQAqls7hlix00ZbxR1yLs8WQr0baw8rieN4HAqrtdcT2zcm59Rdi3uLCDWXjd

