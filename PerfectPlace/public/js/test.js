//<![CDATA[
    require.config({
        paths: {
            FilterBundle: "filter.bundle"
        },
        bundles: {
            FilterBundle: ["Classy", "Asynchronous", "FILTER", "FILTER_CODECS", "FILTER_PLUGINS"]
        }
    });
    require(['cascades/haarcascade_frontalface_alt', 'jQuery', 'Classy', 'Asynchronous', 'FILTER', "FILTER_CODECS", 'FILTER_PLUGINS'], function( haarcascade_frontalface_alt, $, $_1, $_2, $_3, $F ) {
        
        // utils
        function br() { return $('<br />'); }
        function span(t) { return $('<span>'+t+'</span>'); }
        
        var runInThread = /(&|\?)parallel\b/i.test( location.href );
        
        if ( runInThread && !$F.Browser.supportsWorker )
        {
            alert('Browser does not support workers');
        }
        runInThread = !!($F.Browser.supportsWorker && runInThread);
        
        var baseUrl = location.href.split(/#|\?/)[ 0 ]
            ,che = '../common/assets/che.jpg'
            ,yinyang = '../common/assets/yin_yang_blank.png'
            ,yinyang_tga = '../common/assets/yin_yang_blank.tga'
            ,yinyang_gif = '../common/assets/yin_yang_blank.gif'
            ,yinyang_bmp = '../common/assets/yin_yang_blank.bmp'
            ,yinyang_jpg = '../common/assets/yin_yang_blank.jpg'
            ,aside = $('#aside')
            ,applyBt = $('#applyBt')
            ,restoreBt = $('#restoreBt')
            ,container = $('#container'), filters = $('#filters')
             
            ,closeThread = function( ) { this.thread( false ); }
            
             // displacemap
            ,displacemap = $F.Image( )
            
             // images
            ,im1 = $F.HTMLImageLoader.load(che, function( ) {
                // create a displace map image
                displacemap.createImageData(im1.width, im1.height);
                displacemap.octx.fillStyle="rgb(128,128,128)";
                displacemap.octx.fillRect(0,0, displacemap.width, displacemap.height);
                // create radial gradient
                var grd = displacemap.octx.createRadialGradient(displacemap.width/2, displacemap.height/2, 0, displacemap.width/2, displacemap.height/2, displacemap.width/2);
                grd.addColorStop(1, "#808080"); // neutral
                grd.addColorStop(0, "#ffffff"); // white
                displacemap.octx.fillStyle = grd;
                displacemap.octx.beginPath();
                displacemap.octx.arc(displacemap.width/2,displacemap.height/2,displacemap.width/2,0,Math.PI*2,true);
                displacemap.octx.fill();
                displacemap.store();
                
                im15.fill('rgb(200,200,200)', 0, 0, im1.width, im1.height);
            })
            ,im2 = $F.HTMLImageLoader.load( che )
            ,im3 = $F.HTMLImageLoader.load( che )
            ,im4 = $F.HTMLImageLoader.load( che )
            ,im5 = $F.HTMLImageLoader.load( che )
            ,im6 = $F.HTMLImageLoader.load( che )
            ,im7 = $F.HTMLImageLoader.load( che )
            ,im8 = $F.HTMLImageLoader.load( che )
            ,im9 = $F.HTMLImageLoader.load( che )
            ,im10 = $F.HTMLImageLoader.load( che )
            ,im11 = $F.HTMLImageLoader.load( che )
            ,im12 = $F.HTMLImageLoader.load( che )
            ,im13 = $F.HTMLImageLoader.load( che )
            ,im14 = $F.HTMLImageLoader.load( che )
            ,im15 = $F.Image()
            ,im16 = $F.HTMLImageLoader.load( yinyang )
            //,im16 = $F.BinaryLoader( $F.Codec.PNG.decoder ).load( yinyang )
            //,im16 = $F.BinaryLoader( $F.Codec.GIF.decoder ).load( yinyang_gif )
            //,im16 = $F.BinaryLoader( $F.Codec.JPG.decoder ).load( yinyang_jpg )
            //,im16 = $F.BinaryLoader( $F.Codec.BMP.decoder ).load( yinyang_bmp )
            //,im16 = $F.BinaryLoader( $F.Codec.TGA.decoder ).load( yinyang_tga )
            ,im17 = $F.HTMLImageLoader.load( che )
            ,im18 = $F.HTMLImageLoader.load( che )
            ,im19 = $F.HTMLImageLoader.load( che )
            
             // filters
            //,redChannel = new $F.ColorMatrixFilter( ).worker( runInThread ).redChannel( )
            ,redChannel = new $F.CustomFilter(function(filt, im, w, h) { 
                var l = im.length, i;
                // get red channel using a custom filter that can run in parallel worker also
                for (i=0; i<l; i+=4)
                {
                    im[ i+1 ] = 0;
                    im[ i+2 ] = 0;
                }
                return im;
            }).worker( runInThread )
            ,greenChannel = new $F.ColorMatrixFilter( ).worker( runInThread ).greenChannel( )
            ,blueChannel = new $F.ColorMatrixFilter( ).worker( runInThread ).blueChannel( )
            ,clr = new $F.ColorMatrixFilter( ).worker( runInThread ).colorize( 0xff0000 )
            //,gamma = new $F.TableLookupFilter( ).worker( runInThread ).gammaCorrection( 1.7 )
            //,solarize = new $F.TableLookupFilter( ).worker( runInThread ).solarize( 0.5 )
            ,posterize = new $F.TableLookupFilter( ).worker( runInThread ).posterize( 4 )
            //,extract = new $F.TableLookupFilter( ).worker( runInThread ).extract( $F.CHANNEL.RED, [0x75, 0x91] )
            //,mask = new $F.TableLookupFilter( ).worker( runInThread ).mask( 0xffff7732 )
            //,swapChannels = new $F.ColorMatrixFilter( ).worker( runInThread ).swapChannels( $F.CHANNEL.BLUE, $F.CHANNEL.GREEN )
            //,maskChannel = new $F.ColorMatrixFilter( ).worker( runInThread ).maskChannel( $F.CHANNEL.GREEN )
            //,invert = new $F.TableLookupFilter( ).worker( runInThread ).invert( )
            /*,erode = new $F.MorphologicalFilter( ).worker( runInThread ).erode([
                0, 0, 0, 1,
                0, 0, 1, 0,
                0, 1, 0, 0,
                1, 0, 0, 0
            ])*/
            ,equalize = new $F.HistogramEqualizeFilter( ).worker( runInThread )
            //,rgbequalize = new $F.RGBHistogramEqualizeFilter( ).worker( runInThread )
            //,noise = new $F.NoiseFilter( -127, 127 ).worker( runInThread )
            ,sepia = new $F.ColorMatrixFilter( ).worker( runInThread ).sepia2( )
            ,gray = new $F.ColorMatrixFilter( ).worker( runInThread ).grayscale( )
            //,binary = new $F.TableLookupFilter( ).worker( runInThread ).threshold( 0.7 )
            //,threshold = new $F.ColorMatrixFilter( ).worker( runInThread ).threshold_rgb( 128 )
            ,grc = new $F.ColorMatrixFilter( ).worker( runInThread ).grayscale( ).contrast( 1 )
            //,median = new $F.StatisticalFilter( ).worker( runInThread ).median( 5 )
            //,maximum = new $F.StatisticalFilter( ).worker( runInThread ).maximum( 15 )
            ,pixelate = new $F.PixelateFilter( 10 ).worker( runInThread )
            //,tripixelate = new $F.TriangularPixelateFilter( 10 ).worker( runInThread )
            //,pixelate = new $F.HexagonalPixelateFilter( 20 ).worker( runInThread )
            //,hueExtractor = new $F.HueExtractorFilter([10, 36]).worker( runInThread ) // extract hues corresponding to skin color
            //,thresh = new $F.TableLookupFilter( ).worker( runInThread ).threshold( 0.94 )
            //,hsv = new $F.HSVConverterFilter( ).worker( runInThread )
            //,skinExtractor = new $F.CompositeFilter([hsv, redChannel, invert, gray, thresh]).worker( runInThread ) // extract skin region
            //,laplace = new $F.ConvolutionMatrixFilter( ).worker( runInThread ).laplace( 7 )
            ,twirl = new $F.GeometricMapFilter( ).worker( runInThread ).twirl( Math.PI/2, 120, 0.33, 0.27 )
            ,shift = new $F.GeometricMapFilter( ).worker( runInThread ).shift(-50)
            //,rotate = new $F.GeometricMapFilter( ).worker( runInThread ).rotateCCW( )
            //,blur = new $F.ConvolutionMatrixFilter( ).worker( runInThread ).boxBlur( 3 )
            //,gauss = new $F.ConvolutionMatrixFilter( ).worker( runInThread ).fastGauss( 3 )//gaussBlur(3)
            //,vertical = new $F.ConvolutionMatrixFilter( ).worker( runInThread ).verticalBlur( 21 )
            //,diagonal = new $F.ConvolutionMatrixFilter( ).worker( runInThread ).directionalBlur( 45, 9 )
            ,sobel = new $F.ConvolutionMatrixFilter( ).worker( runInThread ).sobel( 3 )
            //,glow = new $F.ConvolutionMatrixFilter( ).worker( runInThread ).glow( )
            ,emboss = new $F.ConvolutionMatrixFilter( ).worker( runInThread ).emboss( )
            ,grsb = new $F.CompositeFilter([gray, sobel/*, binary*/]).worker( runInThread )
            ,displace = new $F.DisplacementMapFilter( /*displacemap*/ ).worker( runInThread )
            ,floodFill = new $F.CompositeFilter([
                new $F.FloodFillFilter(25/* x0 */,75/* y0 */,[255,0,0]/* fill color */,0.8/* tolerance */),
                new $F.FloodFillFilter(125/* x0 */,75/* y0 */,[0,0,255]/* fill color */,0.8/* tolerance */)
            ]).worker( runInThread )
            ,seamless = new $F.SeamlessTileFilter().worker( runInThread )
            /*,halfTone = new $F.CompositeFilter([
                gray,
                new $F.HalftoneFilter().threshold(0.4).size(1).grayscale(true)
            ]).worker( runInThread )*/
            //,halfTone = new $F.HalftoneFilter().size(1).threshold(0.4).grayscale(false).worker( runInThread )
            //,seamless = new $F.RGBSplitFilter(.1,.2,.5).worker( runInThread )
            /*,simplexNoise = new $F.CompositeFilter([
                new $F.PerlinNoiseFilter(80,50).simplex().octaves(4, [[0,0],[10,10], [20,10], [10,20]]).seamless(true)
                //seamless,
                //,shift
            ]).worker( runInThread )*/
            ,simplexNoise = new $F.PerlinNoiseFilter(80,50).simplex().octaves(4, [[0,0],[10,10], [20,10], [10,20]]).seamless(true).worker( runInThread )
            //,bokeh = new $F.BokehFilter(80, 90, 60, 10).worker( runInThread )
            ,canny = new $F.CannyEdgesFilter( 1, 7 ).worker( runInThread )
            ,faceDetector = …