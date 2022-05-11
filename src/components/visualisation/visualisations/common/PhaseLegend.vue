<!--
    Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
    Licensed under the EUPL. See LICENSE.txt.
-->

<script setup lang="ts">
import { lch, css } from "@thi.ng/color";
</script>

<template>
    <svg
        style="background: transparent"
        font-family="system-ui, sans-serif"
        font-size="10"
        width="240"
        height="50"
        viewBox="0 0 240 50"
    >
        <defs>
            <linearGradient id="Gradient2">
                <stop
                    v-for="index in 100"
                    :key="index"
                    :offset="`${index}%`"
                    :stop-color="css(lch(0.75, 0.5, index / 100))"
                />
            </linearGradient>
        </defs>
        <rect fill="url(#Gradient2)" x="10" y="18" height="10" width="220" />
        <g
            transform="translate(0,28)"
            fill="none"
            text-anchor="middle"
            font-variant="tabular-nums"
        >
            <g class="tick" opacity="1" transform="translate(10,0)">
                <line stroke="currentColor" y2="6" y1="-10"></line>
                <text fill="currentColor" y="9" dy="0.71em">-π</text>
            </g>
            <g class="tick" opacity="1" transform="translate(65,0)">
                <line stroke="currentColor" y2="6" y1="-10"></line>
                <text fill="currentColor" y="9" dy="0.71em">-π/2</text>
            </g>
            <g class="tick" opacity="1" transform="translate(120,0)">
                <line stroke="currentColor" y2="6" y1="-10"></line>
                <text fill="currentColor" y="9" dy="0.71em">0</text>
            </g>
            <g class="tick" opacity="1" transform="translate(175,0)">
                <line stroke="currentColor" y2="6" y1="-10"></line>
                <text fill="currentColor" y="9" dy="0.71em">π/2</text>
            </g>
            <g class="tick" opacity="1" transform="translate(230,0)">
                <line stroke="currentColor" y2="6" y1="-10"></line>
                <text fill="currentColor" y="9" dy="0.71em">π</text>
            </g>
            <text
                x="0"
                y="-16"
                fill="currentColor"
                text-anchor="start"
                font-weight="bold"
            >
                phase
            </text>
        </g>
    </svg>
</template>
