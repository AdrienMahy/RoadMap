--
-- PostgreSQL database dump
--

\restrict vgLcqfG70vI6M2pbIi4z4ddWFPvZk1NQDfW68JhNqcP4ao2zLDbgjYRQgaORtUl

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: roadmap
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    target_type character varying(50) NOT NULL,
    target_id integer NOT NULL,
    parent_comment_id integer NOT NULL,
    author character varying(255) DEFAULT 'board'::character varying NOT NULL,
    content text NOT NULL,
    status character varying(50) DEFAULT 'open'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
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
-- Name: comments_parent_comment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: roadmap
--

ALTER SEQUENCE public.comments_parent_comment_id_seq OWNED BY public.comments.parent_comment_id;


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
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    icon character varying(50),
    priority character varying(20) DEFAULT 'medium'::character varying NOT NULL
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
-- Name: modules_project_id_seq; Type: SEQUENCE; Schema: public; Owner: roadmap
--

CREATE SEQUENCE public.modules_project_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.modules_project_id_seq OWNER TO roadmap;

--
-- Name: modules_project_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: roadmap
--

ALTER SEQUENCE public.modules_project_id_seq OWNED BY public.modules.project_id;


--
-- Name: points; Type: TABLE; Schema: public; Owner: roadmap
--

CREATE TABLE public.points (
    id integer NOT NULL,
    stage_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    completed boolean DEFAULT false NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    priority character varying(20) DEFAULT 'medium'::character varying NOT NULL
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
    order_index integer DEFAULT 0 NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    icon character varying(50),
    priority character varying(20) DEFAULT 'medium'::character varying NOT NULL
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
-- Name: stages_module_id_seq; Type: SEQUENCE; Schema: public; Owner: roadmap
--

CREATE SEQUENCE public.stages_module_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stages_module_id_seq OWNER TO roadmap;

--
-- Name: stages_module_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: roadmap
--

ALTER SEQUENCE public.stages_module_id_seq OWNED BY public.stages.module_id;


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
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: roadmap
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: comments target_id; Type: DEFAULT; Schema: public; Owner: roadmap
--

ALTER TABLE ONLY public.comments ALTER COLUMN target_id SET DEFAULT nextval('public.comments_target_id_seq'::regclass);


--
-- Name: comments parent_comment_id; Type: DEFAULT; Schema: public; Owner: roadmap
--

ALTER TABLE ONLY public.comments ALTER COLUMN parent_comment_id SET DEFAULT nextval('public.comments_parent_comment_id_seq'::regclass);


--
-- Name: modules id; Type: DEFAULT; Schema: public; Owner: roadmap
--

ALTER TABLE ONLY public.modules ALTER COLUMN id SET DEFAULT nextval('public.modules_id_seq'::regclass);


--
-- Name: modules project_id; Type: DEFAULT; Schema: public; Owner: roadmap
--

ALTER TABLE ONLY public.modules ALTER COLUMN project_id SET DEFAULT nextval('public.modules_project_id_seq'::regclass);


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
-- Name: stages module_id; Type: DEFAULT; Schema: public; Owner: roadmap
--

ALTER TABLE ONLY public.stages ALTER COLUMN module_id SET DEFAULT nextval('public.stages_module_id_seq'::regclass);


--
-- Name: update_history id; Type: DEFAULT; Schema: public; Owner: roadmap
--

ALTER TABLE ONLY public.update_history ALTER COLUMN id SET DEFAULT nextval('public.update_history_id_seq'::regclass);


--
-- Name: update_history target_id; Type: DEFAULT; Schema: public; Owner: roadmap
--

ALTER TABLE ONLY public.update_history ALTER COLUMN target_id SET DEFAULT nextval('public.update_history_target_id_seq'::regclass);


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: roadmap
--

COPY public.comments (id, target_type, target_id, parent_comment_id, author, content, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: modules; Type: TABLE DATA; Schema: public; Owner: roadmap
--

COPY public.modules (id, project_id, name, description, status, order_index, created_at, updated_at, icon, priority) FROM stdin;
2	2	Holocron Module	Module for Holocron	planned	0	2026-08-26 07:46:27.199807	2026-08-26 07:46:27.199807	\N	medium
3	3	TacticalDisplay Module	Module for TacticalDisplay	planned	0	2026-08-26 07:46:27.202973	2026-08-26 07:46:27.202973	\N	medium
4	4	ControlDisplay Module	Module for ControlDisplay	planned	0	2026-08-26 07:46:27.205733	2026-08-26 07:46:27.205733	\N	medium
5	5	Holonet Module	Module for Holonet	planned	0	2026-08-26 07:46:27.20661	2026-08-26 07:46:27.20661	\N	medium
6	6	QuestionnaireApp Module	Module for QuestionnaireApp	planned	0	2026-08-26 07:46:27.213475	2026-08-26 07:46:27.213475	\N	medium
7	7	Scrapper Module	Module for Scrapper	planned	0	2026-08-26 07:46:27.21516	2026-08-26 07:46:27.21516	\N	medium
1	1	AMS	Interface unifiée pour gérer tous les aspects d’un club sportif.	planned	0	2026-08-26 07:46:27.181999	2026-08-26 07:46:27.181999	\N	medium
\.


--
-- Data for Name: points; Type: TABLE DATA; Schema: public; Owner: roadmap
--

COPY public.points (id, stage_id, name, description, completed, order_index, created_at, updated_at, priority) FROM stdin;
6	3	Séparation du module Match du Planning et création d’un module indépendant		f	0	2026-08-26 07:46:27.189751	2026-08-26 07:46:27.189751	medium
7	3	Création d’une section « Retour individuel »		f	1	2026-08-26 07:46:27.19023	2026-08-26 07:46:27.19023	medium
8	3	Création d’une section « Analyse » pour le reporting des prestations des joueurs		f	2	2026-08-26 07:46:27.190768	2026-08-26 07:46:27.190768	medium
9	3	Création du module « Joueurs en prêt »		f	3	2026-08-26 07:46:27.191316	2026-08-26 07:46:27.191316	medium
10	4	Création d’événements hors GPS : musculation, séances individuelles, événements hors football, etc.		f	0	2026-08-26 07:46:27.192217	2026-08-26 07:46:27.192217	medium
11	5	Sortir de la dépendance à Tableau et passer les visuels en React		f	0	2026-08-26 07:46:27.193287	2026-08-26 07:46:27.193287	medium
12	5	Création des différentes analyses pour chaque KPI		f	1	2026-08-26 07:46:27.193697	2026-08-26 07:46:27.193697	medium
13	5	Création d’un module d’exploration des données pour la création de séances ou l’analyse d’un joueur		f	2	2026-08-26 07:46:27.19415	2026-08-26 07:46:27.19415	medium
14	6	Création d’un espace dédié aux joueurs avec accès à leurs propres données		f	0	2026-08-26 07:46:27.195435	2026-08-26 07:46:27.195435	medium
15	6	Accès à un planning individuel en lien avec le module Planning		f	1	2026-08-26 07:46:27.19585	2026-08-26 07:46:27.19585	medium
16	7	Migration du service Questionnaire sur le serveur AMS		f	0	2026-08-26 07:46:27.196789	2026-08-26 07:46:27.196789	medium
17	7	Accès aux questionnaires depuis l’interface Joueur		f	1	2026-08-26 07:46:27.197141	2026-08-26 07:46:27.197141	medium
18	8	Refonte du module pour intégrer les données tactico-techniques de SportsDynamics		f	0	2026-08-26 07:46:27.198127	2026-08-26 07:46:27.198127	medium
19	8	Intégration des données des autres providers		f	1	2026-08-26 07:46:27.19845	2026-08-26 07:46:27.19845	medium
20	8	Création de rapports individualisés		f	2	2026-08-26 07:46:27.198854	2026-08-26 07:46:27.198854	medium
21	9	Création d’un coffre-fort pour les contenus sensibles		f	0	2026-08-26 07:46:27.201071	2026-08-26 07:46:27.201071	medium
22	10	Création de programmes de diffusion selon des plages horaires		f	0	2026-08-26 07:46:27.201991	2026-08-26 07:46:27.201991	medium
23	11	Création d’un setup « Championnat »		f	0	2026-08-26 07:46:27.203982	2026-08-26 07:46:27.203982	medium
24	12	Création d’un système de suivi des scores		f	0	2026-08-26 07:46:27.204968	2026-08-26 07:46:27.204968	medium
25	13	Passage de l’application Desktop à une architecture centralisée sur un serveur dédié		f	0	2026-08-26 07:46:27.207655	2026-08-26 07:46:27.207655	medium
26	13	Évolution vers une application de type VMS		f	1	2026-08-26 07:46:27.208314	2026-08-26 07:46:27.208314	medium
27	13	Centralisation des commandes des caméras		f	2	2026-08-26 07:46:27.208998	2026-08-26 07:46:27.208998	medium
28	13	Centralisation des enregistrements		f	3	2026-08-26 07:46:27.209431	2026-08-26 07:46:27.209431	medium
29	14	Création d’un espace de stockage personnel et sécurisé pour les utilisateurs		f	0	2026-08-26 07:46:27.210357	2026-08-26 07:46:27.210357	medium
30	15	Programmation de contenus sur les télévisions		f	0	2026-08-26 07:46:27.21136	2026-08-26 07:46:27.21136	medium
31	16	Contrôle poussé des télévisions		f	0	2026-08-26 07:46:27.212189	2026-08-26 07:46:27.212189	medium
32	16	Allumage à distance des télévisions		f	1	2026-08-26 07:46:27.212539	2026-08-26 07:46:27.212539	medium
1	1	Refonte du système d’association Joueur / Saison pour améliorer le suivi historique des données		t	0	2026-08-26 07:46:27.18518	2026-08-26 12:15:26.403	medium
3	2	Amélioration du suivi de la réhabilitation : exercices, étapes, rechutes, etc.		t	0	2026-08-26 07:46:27.187223	2026-08-26 13:24:14.605	medium
33	1	Ceci est un test		t	1	2026-08-26 10:18:14.914784	2026-08-26 13:26:39.238	medium
35	1	troisième test		t	2	2026-08-26 11:35:36.459072	2026-08-27 08:51:22.824	medium
34	1	Deuxième test d'ajout 		t	3	2026-08-26 11:07:43.423095	2026-08-27 08:51:24.268	medium
2	1	Déploiement sur les réseaux publics pour rendre AMS accessible depuis l’extérieur du réseau interne		t	4	2026-08-26 07:46:27.185991	2026-08-27 08:51:24.959	medium
4	2	Ajout d’alerteurs de blessure		t	1	2026-08-26 07:46:27.187685	2026-08-27 10:06:24.662	medium
5	2	Amélioration de la définition du statut du joueur via les questionnaires et/ou les données GPS		t	2	2026-08-26 07:46:27.188424	2026-08-27 10:06:27.831	medium
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: roadmap
--

COPY public.projects (id, name, description, status, order_index, created_at, updated_at) FROM stdin;
1	AMS	Interface unifiée pour gérer tous les aspects d’un club sportif.	planned	0	2026-08-26 07:46:27.17853	2026-08-26 07:46:27.17853
2	Holocron	Gestion et diffusion des contenus sur l’ensemble des télévisions du club.	planned	0	2026-08-26 07:46:27.199302	2026-08-26 07:46:27.199302
3	TacticalDisplay	Création et contrôle de contenus interactifs et ludiques pour animer l’écran géant du club.	planned	0	2026-08-26 07:46:27.202359	2026-08-26 07:46:27.202359
4	ControlDisplay	Centralisation du contrôle des différentes sources de contenu diffusées sur l’écran géant du club.	planned	0	2026-08-26 07:46:27.205332	2026-08-26 07:46:27.205332
5	Holonet	Application dédiée au contrôle des caméras des terrains et à la création d’enregistrements vidéo.	planned	0	2026-08-26 07:46:27.206131	2026-08-26 07:46:27.206131
6	QuestionnaireApp	Création et diffusion de questionnaires personnalisés à partir des données actualisées de l’AMS.	planned	0	2026-08-26 07:46:27.21293	2026-08-26 07:46:27.21293
7	Scrapper	Automatisation de la récupération et de la mise à jour des données issues des différentes API sportives.	planned	0	2026-08-26 07:46:27.214648	2026-08-26 07:46:27.214648
\.


--
-- Data for Name: stages; Type: TABLE DATA; Schema: public; Owner: roadmap
--

COPY public.stages (id, module_id, name, description, delivery_date, order_index, status, created_at, updated_at, icon, priority) FROM stdin;
9	2	Sécurisation des contenus	Target: 2026-2027	2027-12-31	0	planned	2026-08-26 07:46:27.200566	2026-08-26 07:46:27.200566	\N	medium
10	2	Programmation des diffusions	Target: 2026-2027	2027-12-31	1	planned	2026-08-26 07:46:27.201551	2026-08-26 07:46:27.201551	\N	medium
11	3	Setup Championnat	Target: 2026-2027	2027-12-31	0	planned	2026-08-26 07:46:27.203537	2026-08-26 07:46:27.203537	\N	medium
12	3	Suivi des scores	Target: 2026-2027	2027-12-31	1	planned	2026-08-26 07:46:27.204439	2026-08-26 07:46:27.204439	\N	medium
13	5	Centralisation VMS	Target: 2026-2027	2027-12-31	0	planned	2026-08-26 07:46:27.207092	2026-08-26 07:46:27.207092	\N	medium
14	5	Coffre-fort personnel	Target: 2026-2027	2027-12-31	1	planned	2026-08-26 07:46:27.209961	2026-08-26 07:46:27.209961	\N	medium
15	5	Programmation des télévisions	Target: 2026-2027	2027-12-31	2	planned	2026-08-26 07:46:27.210863	2026-08-26 07:46:27.210863	\N	medium
16	5	Contrôle avancé des télévisions	Target: 2027	2027-12-31	3	planned	2026-08-26 07:46:27.211792	2026-08-26 07:46:27.211792	\N	medium
7	1	Intégration de QuestionnaireApp	Target: 2027	2027-12-31	6	planned	2026-08-26 07:46:27.196397	2026-08-26 07:46:27.196397	\N	medium
8	1	Évolution du module Match	Target: 2027+	2027-12-31	7	planned	2026-08-26 07:46:27.197679	2026-08-26 07:46:27.197679	\N	medium
1	1	AMS 2.0	Interface unifiée pour gérer tous les aspects d’un club sportif.	2026-12-31	0	planned	2026-08-26 07:46:27.183839	2026-08-26 07:46:27.183839	Zap	low
5	1	Amélioration du module Analyse	Target: 2027	2027-12-31	4	planned	2026-08-26 07:46:27.192834	2026-08-26 07:46:27.192834	\N	medium
4	1	Amélioration du module Planning	Target: 2027	2027-12-31	3	planned	2026-08-26 07:46:27.191741	2026-08-26 07:46:27.191741	\N	medium
3	1	Création du module Match	Target: 2026-2027	2027-12-31	2	planned	2026-08-26 07:46:27.189074	2026-08-26 07:46:27.189074	\N	medium
2	1	Amélioration du module Medical	Target: 2026-2027	2027-12-31	1	planned	2026-08-26 07:46:27.186642	2026-08-26 07:46:27.186642	\N	medium
6	1	Création du module Player	Target: 2027	2027-12-31	5	planned	2026-08-26 07:46:27.194887	2026-08-26 07:46:27.194887	\N	medium
\.


--
-- Data for Name: update_history; Type: TABLE DATA; Schema: public; Owner: roadmap
--

COPY public.update_history (id, target_type, target_id, action, old_value, new_value, changed_by, created_at) FROM stdin;
1	point	1	status_changed	pending	completed	api	2026-08-26 07:48:31.182395
2	point	33	created	\N	{"id":33,"stageId":1,"name":"Ceci est un test","description":"","completed":false,"orderIndex":0,"createdAt":"2026-08-26T10:18:14.914Z","updatedAt":"2026-08-26T10:18:14.914Z"}	api	2026-08-26 10:18:14.920808
3	point	34	created	\N	{"id":34,"stageId":1,"name":"Deuxième test d'ajout ","description":"","completed":false,"orderIndex":0,"createdAt":"2026-08-26T11:07:43.423Z","updatedAt":"2026-08-26T11:07:43.423Z"}	api	2026-08-26 11:07:43.428694
4	point	35	created	\N	{"id":35,"stageId":1,"name":"troisième test","description":"","completed":false,"orderIndex":0,"createdAt":"2026-08-26T11:35:36.459Z","updatedAt":"2026-08-26T11:35:36.459Z"}	api	2026-08-26 11:35:36.463123
5	point	3	status_changed	pending	completed	api	2026-08-26 13:24:14.608608
6	point	33	status_changed	pending	completed	api	2026-08-26 13:26:37.036279
7	point	35	status_changed	pending	completed	api	2026-08-26 13:32:47.310552
8	point	35	status_changed	completed	pending	api	2026-08-26 13:32:48.247808
9	point	35	status_changed	pending	completed	api	2026-08-26 13:32:50.028218
10	point	35	status_changed	completed	pending	api	2026-08-26 13:32:51.022959
11	stage	17	created	\N	{"id":17,"moduleId":9,"name":"Setup VPC","description":"Create Virtual Private Cloud","deliveryDate":"2026-09-15","icon":null,"priority":"critical","orderIndex":0,"status":"pending","createdAt":"2026-08-26T15:44:44.956Z","updatedAt":"2026-08-26T15:44:44.956Z"}	system	2026-08-26 15:44:44.960242
12	stage	18	created	\N	{"id":18,"moduleId":9,"name":"Configure Security","description":"Implement security groups","deliveryDate":"2026-09-30","icon":null,"priority":"critical","orderIndex":0,"status":"pending","createdAt":"2026-08-26T15:44:45.017Z","updatedAt":"2026-08-26T15:44:45.017Z"}	system	2026-08-26 15:44:45.021906
13	stage	19	created	\N	{"id":19,"moduleId":9,"name":"Deploy Databases","description":"PostgreSQL and Redis setup","deliveryDate":"2026-10-15","icon":null,"priority":"high","orderIndex":0,"status":"pending","createdAt":"2026-08-26T15:44:45.104Z","updatedAt":"2026-08-26T15:44:45.104Z"}	system	2026-08-26 15:44:45.106265
14	stage	20	created	\N	{"id":20,"moduleId":12,"name":"Core API","description":"Build main endpoints","deliveryDate":"2026-10-01","icon":null,"priority":"high","orderIndex":0,"status":"pending","createdAt":"2026-08-26T15:52:13.047Z","updatedAt":"2026-08-26T15:52:13.047Z"}	system	2026-08-26 15:52:13.050977
15	stage	21	created	\N	{"id":21,"moduleId":12,"name":"Authentication","description":"JWT implementation","deliveryDate":"2026-10-10","icon":null,"priority":"high","orderIndex":0,"status":"pending","createdAt":"2026-08-26T15:52:13.115Z","updatedAt":"2026-08-26T15:52:13.115Z"}	system	2026-08-26 15:52:13.117848
16	stage	22	created	\N	{"id":22,"moduleId":12,"name":"Documentation","description":"API documentation","deliveryDate":"2026-10-25","icon":null,"priority":"medium","orderIndex":0,"status":"pending","createdAt":"2026-08-26T15:52:13.166Z","updatedAt":"2026-08-26T15:52:13.166Z"}	system	2026-08-26 15:52:13.1681
17	stage	23	created	\N	{"id":23,"moduleId":13,"name":"Unit Tests","description":"Write unit tests","deliveryDate":"2026-10-20","icon":null,"priority":"high","orderIndex":0,"status":"pending","createdAt":"2026-08-26T15:52:13.218Z","updatedAt":"2026-08-26T15:52:13.218Z"}	system	2026-08-26 15:52:13.220238
18	stage	24	created	\N	{"id":24,"moduleId":13,"name":"Integration Tests","description":"Test integration","deliveryDate":"2026-11-01","icon":null,"priority":"medium","orderIndex":0,"status":"pending","createdAt":"2026-08-26T15:52:57.558Z","updatedAt":"2026-08-26T15:52:57.558Z"}	system	2026-08-26 15:52:57.56029
19	stage	25	created	\N	{"id":25,"moduleId":13,"name":"Performance Testing","description":"Load testing","deliveryDate":"2026-11-10","icon":null,"priority":"medium","orderIndex":0,"status":"pending","createdAt":"2026-08-26T15:52:58.119Z","updatedAt":"2026-08-26T15:52:58.119Z"}	system	2026-08-26 15:52:58.121616
20	point	35	status_changed	pending	completed	api	2026-08-27 08:51:22.828254
21	point	34	status_changed	pending	completed	api	2026-08-27 08:51:24.272433
22	point	2	status_changed	pending	completed	api	2026-08-27 08:51:24.963252
23	point	4	status_changed	pending	completed	api	2026-08-27 10:06:24.667233
24	point	5	status_changed	pending	completed	api	2026-08-27 10:06:27.025128
\.


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

SELECT pg_catalog.setval('public.modules_id_seq', 13, true);


--
-- Name: modules_project_id_seq; Type: SEQUENCE SET; Schema: public; Owner: roadmap
--

SELECT pg_catalog.setval('public.modules_project_id_seq', 1, false);


--
-- Name: points_id_seq; Type: SEQUENCE SET; Schema: public; Owner: roadmap
--

SELECT pg_catalog.setval('public.points_id_seq', 35, true);


--
-- Name: points_stage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: roadmap
--

SELECT pg_catalog.setval('public.points_stage_id_seq', 1, false);


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: roadmap
--

SELECT pg_catalog.setval('public.projects_id_seq', 7, true);


--
-- Name: stages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: roadmap
--

SELECT pg_catalog.setval('public.stages_id_seq', 25, true);


--
-- Name: stages_module_id_seq; Type: SEQUENCE SET; Schema: public; Owner: roadmap
--

SELECT pg_catalog.setval('public.stages_module_id_seq', 1, false);


--
-- Name: update_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: roadmap
--

SELECT pg_catalog.setval('public.update_history_id_seq', 24, true);


--
-- Name: update_history_target_id_seq; Type: SEQUENCE SET; Schema: public; Owner: roadmap
--

SELECT pg_catalog.setval('public.update_history_target_id_seq', 1, false);


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
-- PostgreSQL database dump complete
--

\unrestrict vgLcqfG70vI6M2pbIi4z4ddWFPvZk1NQDfW68JhNqcP4ao2zLDbgjYRQgaORtUl

