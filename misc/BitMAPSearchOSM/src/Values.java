import java.awt.GraphicsEnvironment;

/**
 * This class contains all non-text constant values used in the program.
 * 
 * @author Judith Höreth
 * 
 */
public class Values {

	// Dimensions of whole Applet
	static final int WINDOW_WIDTH = (int) GraphicsEnvironment
			.getLocalGraphicsEnvironment().getMaximumWindowBounds().getWidth();
	static final int WINDOW_HEIGHT = (int) GraphicsEnvironment
			.getLocalGraphicsEnvironment().getMaximumWindowBounds().getHeight();

	// Dimensions of the Map
	static final int WIDTH = WINDOW_WIDTH * 2 / 3;
	static final int HEIGHT = WINDOW_HEIGHT * 4 / 5;

	// Height and Width of one maptile in OSM
	static final int TILES_SIZE = 256;

	//basic limits of the best-match and second-match
	static final int BEST_MATCH_LIMIT=20;
	static final int SECOND_MATCH_LIMIT=10;
	
	// standard values for blur and icon size
	static final int GAUSS_BLUR_VALUE = 85;
	static final int ICON_SIZE_DEFAULT = 50;

	// transparency-value of the different overlays
	static final float TRANSPARENCY_LAYER = 0.2f;

	// possibility of choosing different importance-values for the query
	static final int VERY_IMPORTANT = 2;
	static final int IMPORTANT = 1;
	static final int NOT_IMPORTANT = 0;

	// maximum values of the sliders
	public static final int DISTANCE_SLIDER = 9;

	public static final int POSITIVE = 1;
	public static final int NEGATIVE = -1;

	// scale-values to adapt the colors used for drawing to the different
	// layers(first layers need stronger colors as they are overlapped by the
	// other, semi-transparent,layers).
	public static final float[] SCALE_ALPHA_ARRAY = new float[] { 1, 0.85f,
			0.77f, 0.85f };

	// max zoom for map
	public static final int MAX_ZOOM = 17;
	
	//values to distinguish between different sorts of a dialog
	public static final int DIALOG_WITHOUT_ANY=0;
	public static final int DIALOG_WITH_TEXTFIELD=1;
	public static final int DIALOG_WITH_LIST=2;

}
