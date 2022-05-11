<!--
    Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
    Licensed under the EUPL. See LICENSE.txt.
-->

<template>
    <div class="wrapper">
        <div class="loader">
            <div class="inner one"></div>
            <div class="inner two"></div>
            <div class="inner three"></div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.wrapper {
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;

    > .loader {
        position: absolute;
    }
}
</style>
