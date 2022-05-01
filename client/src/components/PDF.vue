<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js'
// @ts-ignore
import PDFJSWorker from 'pdfjs-dist/legacy/build/pdf.worker.entry'
import * as pdfjsViewer from 'pdfjs-dist/legacy/web/pdf_viewer'
import { PDFDocumentProxy, PDFPageProxy, PDFDocumentLoadingTask } from 'pdfjs-dist/types/src/display/api'
import { PageViewport } from 'pdfjs-dist/types/src/display/display_utils'
import 'pdfjs-dist/legacy/web/pdf_viewer.css'

interface VuePdfPropsType {
    src: string;
    page?: number;
    scale?: number;
}

const createLoadingTask = (src: string): PDFDocumentLoadingTask => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJSWorker
    const loadingTask = pdfjsLib.getDocument(src)
    return loadingTask
}

export default defineComponent({
    props: {
        /**
         * The source of the pdf. Accepts the following types `string | URL | Uint8Array | PDFDataRangeTransport | DocumentInitParameters`
         */
        src: {
            type: String,
            required: true
        },
        /**
         * The page number of the pdf to display.
         */
        page: {
            type: Number,
            default: 1
        },
        /**
         * The scale (zoom) of the pdf. Setting this will also disable auto scaling and resizing. 
         */
        scale: {
            type: Number,
            default: null
        }
    },
    setup(props: VuePdfPropsType, ctx) {
        const loading = ref<boolean>(false)
        const pdfWrapperRef = ref<HTMLElement | null>(null)
        const parentWrapperRef = ref<HTMLElement | null>(null)
        let thePDF: PDFDocumentProxy
        const numberOfPages = ref<number>(0)
        const eventBus = ref(null)
        const pageNumber = computed(() => props.page || 1)
        const initPdfWorker = () => {
            loading.value = true
            pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJSWorker
            const loadingTask = createLoadingTask(props.src)
            loadingTask.promise.then((pdf: PDFDocumentProxy) => {
                ctx.emit('pdfLoaded', pdf)
                thePDF = pdf
                numberOfPages.value = pdf.numPages
                ctx.emit('totalPages', numberOfPages.value)
                if (pageNumber.value <= numberOfPages.value) {
                    pdf.getPage(pageNumber.value).then((page: PDFPageProxy) => renderPage(page))
                }
            })
        }
        const renderPage = async (page: PDFPageProxy) => {
            loading.value = true
            const pdfWrapperEl = pdfWrapperRef.value as HTMLElement
            const parentWrapperEl = parentWrapperRef.value as HTMLElement
            // Create a wrapper for each page
            const pageWrapper = document.createElement('div')
            pageWrapper.classList.add('vue-pdf__wrapper')
            pageWrapper.id = `vue-pdf-page-${props.page}`
            // Create a canvas element for each page to draw on
            const canvas = document.createElement('canvas')
            pageWrapper.appendChild(canvas)
            // Create an annotation layer for each page
            const annotationLayer = document.createElement('div')
            // Create div which will hold text-fragments (for selection)
            const textLayerDiv = document.createElement('div');
            textLayerDiv.classList.add('textLayer', 'vue-pdf__wrapper-text-layer')
            pageWrapper.appendChild(textLayerDiv)
            pdfWrapperEl?.appendChild(pageWrapper)
            // This gives us the page's dimensions at full scale
            const initViewport = page.getViewport({ scale: 1 })

            const context = canvas.getContext('2d')
            await scaleCanvas(pdfWrapperEl, initViewport, page, canvas, context, textLayerDiv, annotationLayer)
            if (!props.scale) {
                const debouncedScaling = debounce(async () => await scaleCanvas(pdfWrapperEl, initViewport, page, canvas, context, textLayerDiv, annotationLayer))
                window.addEventListener('resize', debouncedScaling);
            } else {
                parentWrapperEl.style.display = 'inline-block';
                pdfWrapperEl.style.display = 'inline-block';
            }
        }
        watch(pageNumber, async () => {
            if (pageNumber.value <= numberOfPages.value) {
                const pdfWrapperEl = pdfWrapperRef.value as HTMLElement
                pdfWrapperEl.firstChild?.remove()
                await thePDF.getPage(pageNumber.value).then(async (page: PDFPageProxy) => await renderPage(page))
            }
        })
        const scaleCanvas = async (
            pdfWrapperEl: HTMLElement,
            intialisedViewport: PageViewport,
            page: PDFPageProxy,
            canvas: HTMLCanvasElement,
            context: any,
            textLayerDiv: HTMLDivElement,
            annotationLayer: HTMLDivElement
        ) => {
            textLayerDiv.innerHTML = ''
            annotationLayer.innerHTML = ''
            const pdfWrapperElStyles = window.getComputedStyle(pdfWrapperEl)
            const pdfWrapperElWidth = parseFloat(pdfWrapperElStyles.width)
            const scale = props.scale ? props.scale : pdfWrapperElWidth / intialisedViewport.width
            const viewport = page.getViewport({ scale })
            // assume the device pixel ratio is 1 if the browser doesn't specify it
            const devicePixelRatio = window.devicePixelRatio || 1;
            // determine the 'backing store ratio' of the canvas context
            const backingStoreRatio = (
                context.webkitBackingStorePixelRatio ||
                context.mozBackingStorePixelRatio ||
                context.msBackingStorePixelRatio ||
                context.oBackingStorePixelRatio ||
                context.backingStorePixelRatio || 1
            );
            // determine the actual ratio we want to draw at
            const ratio = devicePixelRatio / backingStoreRatio;
            if (devicePixelRatio !== backingStoreRatio) {
                // set the 'real' canvas size to the higher width/height
                canvas.width = props.scale ? (viewport.width * ratio) : (pdfWrapperElWidth * ratio);
                canvas.height = viewport.height * ratio;
                // ...then scale it back down with CSS
                canvas.style.width = props.scale ? '' : '100%';
                canvas.style.height = viewport.height + 'px';
            }
            else {
                // this is a normal 1:1 device; just scale it simply
                canvas.width = props.scale ? viewport.width : pdfWrapperElWidth;
                canvas.height = viewport.height;
                canvas.style.width = '';
                canvas.style.height = '';
            }
            // scale the drawing context so everything will work at the higher ratio
            await context.scale(ratio, ratio);
            // Draw it on the canvas
            if (context) {

                await page.render({ canvasContext: context, viewport }).promise.then(async () => {
                    // Render text layer for text selection
                    await page.getTextContent().then(async (textContent) => {
                        if (!eventBus.value) {
                            // @ts-ignore
                            eventBus.value = new pdfjsViewer.EventBus()
                        }
                        // Create new instance of TextLayerBuilder class
                        const textLayer = new pdfjsViewer.TextLayerBuilder({
                            textLayerDiv: textLayerDiv,
                            pageIndex: page._pageIndex,
                            eventBus: eventBus.value,
                            viewport: viewport,
                            enhanceTextSelection: true
                        })
                        // Set text-fragments
                        await textLayer.setTextContent(textContent)
                        ctx.emit('textContent', textContent)
                        // Render text-fragments
                        await textLayer.render();
                    })
                    loading.value = false
                })
            }
        }
        const debounce = (func: { apply: (arg0: void, arg1: any) => void }, timeout = 300) => {
            let timer: any
            return (...args: any) => {
                clearTimeout(timer);
                timer = setTimeout(() => { func.apply(this, args); }, timeout);
            };
        }
        onMounted(() => {
            initPdfWorker()
        })

        return {
            props,
            pdfWrapperRef,
            parentWrapperRef
        }
    }
})
</script>

<template>
    <div class="vue-pdf-main" ref="parentWrapperRef">
        <div class="vue-pdf" ref="pdfWrapperRef"></div>
    </div>
</template>

<style>
.vue-pdf__wrapper {
    position: relative;
}

.vue-pdf__wrapper-text-layer br {
    display: none;
}
</style>