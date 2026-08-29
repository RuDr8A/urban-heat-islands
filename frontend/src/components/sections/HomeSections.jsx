function SectionLabel({ children }) {
    return (
        <div className="text-xs uppercase tracking-[0.22em] text-white/40 font-medium mb-3">
            {children}
        </div>
    );
}

function FeatureCard({ number, title, text }) {
    return (
        <div className="group rounded-3xl border border-white/10 bg-white/[0.035] p-6 hover:bg-white/[0.055] hover:border-white/20 transition-all duration-300">
            <div className="text-sm font-mono text-orange-300/70 mb-5">
                {number}
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">
                {title}
            </h3>

            <p className="text-sm leading-relaxed text-white/45">
                {text}
            </p>
        </div>
    );
}

function PipelineStep({ number, title, text }) {
    return (
        <div className="relative">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-9 h-9 rounded-full border border-white/15 bg-white/[0.04] flex items-center justify-center text-xs font-mono text-white/60">
                    {number}
                </div>

                <div>
                    <h3 className="text-white font-medium mb-1">
                        {title}
                    </h3>

                    <p className="text-sm text-white/40 leading-relaxed">
                        {text}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function HomeSections() {
    return (
        <div className="w-full">

            {/* =====================================================
          DATA
      ===================================================== */}

            <section
                id="data"
                className="w-full px-margin-mobile md:px-margin-desktop py-24 md:py-32"
            >
                <div className="max-w-6xl mx-auto">

                    <div className="max-w-3xl mb-12">
                        <SectionLabel>
                            Data
                        </SectionLabel>

                        <h2 className="text-3xl md:text-5xl font-semibold text-white tracking-tight">
                            Environmental data,
                            <span className="block text-white/45">
                                transformed into heat intelligence.
                            </span>
                        </h2>

                        <p className="mt-6 text-white/50 leading-relaxed max-w-2xl">
                            Urban Heat Intelligence combines land-surface temperature
                            with environmental and geographic indicators to understand
                            how different parts of a city experience surface heat.
                        </p>
                    </div>


                    {/* Dataset overview */}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

                        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
                            <div className="text-3xl font-semibold text-white">
                                14
                            </div>

                            <div className="text-sm text-white/40 mt-2">
                                Indian cities
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
                            <div className="text-3xl font-semibold text-white">
                                5
                            </div>

                            <div className="text-sm text-white/40 mt-2">
                                Analysis years
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
                            <div className="text-3xl font-semibold text-white">
                                7
                            </div>

                            <div className="text-sm text-white/40 mt-2">
                                ML features
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
                            <div className="text-3xl font-semibold text-white">
                                LST
                            </div>

                            <div className="text-sm text-white/40 mt-2">
                                Target variable
                            </div>
                        </div>

                    </div>


                    {/* Feature cards */}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                        <FeatureCard
                            number="01"
                            title="LST"
                            text="Land Surface Temperature — the surface temperature being analysed and predicted."
                        />

                        <FeatureCard
                            number="02"
                            title="NDVI"
                            text="Indicates vegetation and greenery. It helps capture the cooling influence of vegetated areas."
                        />

                        <FeatureCard
                            number="03"
                            title="NDBI"
                            text="Indicates built-up intensity. It helps the model identify areas dominated by urban surfaces."
                        />

                        <FeatureCard
                            number="04"
                            title="NDWI"
                            text="Represents water and surface moisture conditions."
                        />

                        <FeatureCard
                            number="05"
                            title="Albedo"
                            text="Represents surface reflectivity and how much incoming energy the surface reflects."
                        />

                        <FeatureCard
                            number="06"
                            title="Elevation"
                            text="Represents terrain elevation and provides geographic context for the prediction."
                        />

                        <FeatureCard
                            number="07"
                            title="Slope"
                            text="Represents terrain steepness and adds topographic information."
                        />

                        <FeatureCard
                            number="08"
                            title="Land Cover"
                            text="Represents the type of surface present at a location."
                        />

                    </div>


                    <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.025] p-6 md:p-8">

                        <div className="flex flex-col md:flex-row gap-6 md:items-center md:justify-between">

                            <div>
                                <div className="text-white/35 text-xs uppercase tracking-[0.18em] mb-2">
                                    Spatial context
                                </div>

                                <h3 className="text-xl font-medium text-white">
                                    Every observation is tied to a location.
                                </h3>

                                <p className="text-sm text-white/40 mt-2 max-w-2xl leading-relaxed">
                                    Latitude, longitude, city and year allow the system
                                    to connect environmental conditions with their
                                    geographic and temporal context.
                                </p>
                            </div>

                            <div className="font-mono text-sm text-white/35 whitespace-nowrap">
                                latitude · longitude · year
                            </div>

                        </div>

                    </div>

                </div>
            </section>


            {/* =====================================================
          METHODOLOGY
      ===================================================== */}

            <section
                id="methodology"
                className="w-full px-margin-mobile md:px-margin-desktop py-24 md:py-32 border-t border-white/[0.06]"
            >
                <div className="max-w-6xl mx-auto">

                    <div className="max-w-3xl mb-14">
                        <SectionLabel>
                            Methodology
                        </SectionLabel>

                        <h2 className="text-3xl md:text-5xl font-semibold text-white tracking-tight">
                            From environmental observations
                            <span className="block text-white/45">
                                to actionable heat intelligence.
                            </span>
                        </h2>

                        <p className="mt-6 text-white/50 leading-relaxed max-w-2xl">
                            The system combines environmental data processing,
                            machine learning, spatial analysis and explainable AI
                            into a single workflow.
                        </p>
                    </div>


                    {/* Pipeline */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-7">

                            <div className="text-white/35 text-xs uppercase tracking-[0.18em] mb-7">
                                Analysis pipeline
                            </div>

                            <div className="space-y-7">

                                <PipelineStep
                                    number="01"
                                    title="Environmental data"
                                    text="Environmental indicators and geographic information are assembled for spatial locations and analysis years."
                                />

                                <PipelineStep
                                    number="02"
                                    title="Feature preparation"
                                    text="The environmental variables are organised into the seven inputs used by the production ML model."
                                />

                                <PipelineStep
                                    number="03"
                                    title="Machine learning"
                                    text="A Random Forest regression model learns relationships between the environmental features and Land Surface Temperature."
                                />

                                <PipelineStep
                                    number="04"
                                    title="LST prediction"
                                    text="The trained model produces an estimated LST for a location from its environmental conditions."
                                />

                                <PipelineStep
                                    number="05"
                                    title="Spatial analysis"
                                    text="Predictions and observations are mapped across the city to reveal spatial patterns and high-heat areas."
                                />

                            </div>

                        </div>


                        {/* ML explanation */}

                        <div className="rounded-3xl border border-orange-300/15 bg-orange-300/[0.035] p-7">

                            <div className="text-orange-200/55 text-xs uppercase tracking-[0.18em] mb-7">
                                Explainable ML
                            </div>

                            <h3 className="text-2xl font-semibold text-white mb-4">
                                The model is not a black box.
                            </h3>

                            <p className="text-white/45 leading-relaxed mb-8">
                                For an individual location, SHAP explains how each
                                environmental feature contributed to the model's
                                prediction relative to its baseline.
                            </p>


                            <div className="space-y-4">

                                <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
                                    <div className="text-white font-medium">
                                        Positive contribution
                                    </div>

                                    <p className="text-sm text-white/40 mt-1">
                                        Pushes the model prediction upward.
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
                                    <div className="text-white font-medium">
                                        Negative contribution
                                    </div>

                                    <p className="text-sm text-white/40 mt-1">
                                        Pushes the model prediction downward.
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
                                    <div className="text-white font-medium">
                                        Location-specific explanation
                                    </div>

                                    <p className="text-sm text-white/40 mt-1">
                                        The explanation changes with the environmental
                                        conditions at the selected location.
                                    </p>
                                </div>

                            </div>

                        </div>

                    </div>


                    {/* Output layer */}

                    <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-7">

                        <div className="text-white/35 text-xs uppercase tracking-[0.18em] mb-5">
                            Intelligence layer
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            <FeatureCard
                                number="01"
                                title="Predicted LST"
                                text="ML estimates surface temperature from environmental conditions."
                            />

                            <FeatureCard
                                number="02"
                                title="Heat Risk"
                                text="Temperature information is translated into interpretable thermal risk categories."
                            />

                            <FeatureCard
                                number="03"
                                title="Hotspots"
                                text="Spatial analysis identifies high-heat areas and persistent hotspots."
                            />

                        </div>

                    </div>

                </div>
            </section>


            {/* =====================================================
          ABOUT US
      ===================================================== */}

            <section
                id="about"
                className="w-full px-margin-mobile md:px-margin-desktop py-24 md:py-32 border-t border-white/[0.06]"
            >
                <div className="max-w-6xl mx-auto">

                    <div className="max-w-3xl mb-14">
                        <SectionLabel>
                            About Us
                        </SectionLabel>

                        <h2 className="text-3xl md:text-5xl font-semibold text-white tracking-tight">
                            Building tools for
                            <span className="block text-white/45">
                                cooler, more informed cities.
                            </span>
                        </h2>

                        <p className="mt-6 text-white/50 leading-relaxed max-w-2xl">
                            Urban Heat Intelligence is a hackathon prototype focused
                            on turning complex environmental and spatial data into
                            information that can be explored, understood and acted upon.
                        </p>
                    </div>


                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-7">

                            <div className="text-white/35 text-xs uppercase tracking-[0.18em] mb-4">
                                Our approach
                            </div>

                            <h3 className="text-2xl font-semibold text-white mb-4">
                                Data + ML + Spatial Intelligence
                            </h3>

                            <p className="text-white/45 leading-relaxed">
                                Instead of presenting temperature as a collection of
                                isolated numbers, the platform connects environmental
                                conditions, machine-learning predictions and geographic
                                patterns in one interface.
                            </p>

                        </div>


                        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-7">

                            <div className="text-white/35 text-xs uppercase tracking-[0.18em] mb-4">
                                What the platform provides
                            </div>

                            <div className="space-y-4">

                                <div className="flex gap-3">
                                    <span className="text-orange-300/70">→</span>
                                    <span className="text-white/55 text-sm">
                                        City-level spatial heat analysis
                                    </span>
                                </div>

                                <div className="flex gap-3">
                                    <span className="text-orange-300/70">→</span>
                                    <span className="text-white/55 text-sm">
                                        Location-specific LST prediction
                                    </span>
                                </div>

                                <div className="flex gap-3">
                                    <span className="text-orange-300/70">→</span>
                                    <span className="text-white/55 text-sm">
                                        Historical temperature analysis
                                    </span>
                                </div>

                                <div className="flex gap-3">
                                    <span className="text-orange-300/70">→</span>
                                    <span className="text-white/55 text-sm">
                                        SHAP-based model explanations
                                    </span>
                                </div>

                                <div className="flex gap-3">
                                    <span className="text-orange-300/70">→</span>
                                    <span className="text-white/55 text-sm">
                                        Heat-risk and persistent hotspot analysis
                                    </span>
                                </div>

                            </div>

                        </div>

                    </div>


                    {/* Closing statement */}

                    <div className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-r from-white/[0.045] to-white/[0.015] p-8 md:p-10">

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">

                            <div className="max-w-3xl">

                                <div className="text-white/35 text-xs uppercase tracking-[0.18em] mb-3">
                                    Urban Heat Intelligence
                                </div>

                                <p className="text-xl md:text-2xl text-white/80 leading-relaxed">
                                    Making urban heat easier to
                                    <span className="text-white font-medium">
                                        {" "}see, understand and analyse.
                                    </span>
                                </p>

                            </div>

                            <a
                                href="/dashboard"
                                className="flex-shrink-0 inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-colors"
                            >
                                Explore Dashboard →
                            </a>

                        </div>

                    </div>

                </div>
            </section>

        </div>
    );
}