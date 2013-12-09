# $FreeBSD$

PORTNAME=	biblionarrator
PORTVERSION=	0.1.0
GIT_VERSION=	master
CATEGORIES=	misc
MASTER_SITES=	#none
INSTALLDIR=	${PREFIX}/${PORTNAME}

LICENSE=	AGPLv3
MAINTAINER=	jcamins@cpbibliography.com
COMMENT=	Biblionarrator

FETCH_DEPENDS=	git:${PORTSDIR}/devel/git
BUILD_DEPENDS+=	node:${PORTSDIR}/www/node \
		yaz-config:${PORTSDIR}/net/yaz \
		${LOCALBASE}/share/java/maven3/bin/mvn:${PORTSDIR}/devel/maven3

JAVA_VERSION=   1.7
JAVA_VENDOR=    openjdk
USE_JAVA=       yes

OPTIONS_DEFINE= MONGO REDIS GRUNT
MONGO_DESC=	Install MongoDB for use as a datastore
REDIS_DESC=     Install Redis for use as a datastore
GRUNT_DESC=	Install Grunt globally (required for building)
CASSANDRA_DESC=	Install Cassandra 1.2 from local port
ES_DESC=	Install ElasticSearch in /opt (not currently supported; please install ElasticSearch 0.90.5+ manually)


WRKSRC=		${WRKDIR}/biblionarrator

.include <bsd.port.options.mk>

.if ${PORT_OPTIONS:MMONGO}
RUN_DEPENDS+=	mongod:${PORTSDIR}/databases/mongodb
.endif

.if ${PORT_OPTIONS:MREDIS}
RUN_DEPENDS+=	redis-server:${PORTSDIR}/databases/redis
.endif

.if ${PORT_OPTIONS:MCASSANDRA}
RUN_DEPENDS+=   ${JAVALIBDIR}/snappy-java.jar:${PORTSDIR}/archivers/snappy-java
RUN_DEPENDS+=	nodetool:cassandra
.endif

.if ${PORT_OPTIONS:MES}
.endif

do-fetch:
	@if [ ! -e ${WRKSRC}/package.json ]; then \
		${MKDIR} ${WRKDIR}; \
		cd ${WRKDIR} && git clone https://github.com/biblionarrator/biblionarrator.git; \
		cd ${WRKSRC} && git checkout ${GIT_VERSION}; \
	fi

do-extract:
	@${DO_NADA}	#normally do-extract starts with an rm -rf ${WRKSRC}

do-build:
	.if ${PORT_OPTIONS:MGRUNT}
	npm install -g grunt-cli
	.endif
	cd ${WRKSRC} && npm install && rm -R node_modules/express-hbs/node_modules/handlebars

do-install:
	cd ${WRKSRC} && \
	${COPYTREE_SHARE} . ${INSTALLDIR}

.include <bsd.port.mk>
