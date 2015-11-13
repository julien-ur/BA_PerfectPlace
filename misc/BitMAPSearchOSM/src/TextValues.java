/**
 * This class contains all constant values which represent some text within the
 * program, for example the text which is displayed in a dialog.
 * 
 * @author Judith Höreth
 * 
 */
public class TextValues {

	static final String TOO_MUCH_PARAMETER_TITLE = "Zu viele Parameter";
	static final String TOO_MUCH_PARAMETER_TEXT = "In dieser Anwendung sind nur vier Parameter möglich!";

	static final String NEW_PARAMETER_TITLE = "Neuer Parameter";
	static final String NEW_PARAMETER_TEXT = "Bitte wählen Sie den Typ, den der neue Parameter annehmen soll!<br>(positiv: möglichst nahe am zukünftigen Wohnort - negativ: möglichst nicht im Gebiet des zukünftigen Wohnorts)";

	static final String CUSTOM_PARAMETER_TITLE = "Eigene Örtlichkeit festlegen";
	static final String CUSTOM_PARAMETER_TEXT = "Mit dieser Option können Sie eine eigene Örtlichkeit als Parameter festlegen <br> (z.B. Arbeitsplatz, Wohnhaus von Verwandten/Freunden, etc.).<br> Klicken Sie hierzu einfach auf den gewünschten Ort in der Karte! Alternativ können Sie im folgenden Textfeld auch eine Adresse (Straße o.ä.) eingeben.";

	static final String CUSTOM_PARAMETER_NAME_TITLE = "Eigener Örtlichkeit Namen geben";
	static final String CUSTOM_PARAMETER_NAME_TEXT = "Bitte gebe einen Namen für deine gewählte Örtlichkeit ein.";

	static final String HELP_TITLE = "Informationen zum Programm";
	static final String HELP_TEXT = "Hier können Sie für den von Ihnen gewählten Kartenausschnitt verschiedene Parameter wählen, die anschließend auf der Karte für Sie visualisiert werden. <br> Um einen neuen Parameter zu erstellen, drücken Sie auf den \"Neuer Parameter\"-Button. Nach Erstellung des Parameters können Sie diesen nach Ihren Wünschen anpassen.<br> Dafür können Sie entweder eine Kategorie und die dazugehörigen Einrichtungen wählen oder aber über den Punkt \"Eigene Örtlichkeit\" einen eigenen Punkt auf der Karte markieren. <br> Zusätzlich können Sie die gewünschte Maximalentfernung sowie die Wichigkeit des Parameters einstellen. Sie können je nach Belieben bis zu vier Parameter miteinander kombinieren. Je nachdem wie viele der gewählten Parameter sich in der Nähe befinden, desto deutlicher werden die Regionen markiert. In den als am besten ermittelten Regionen werden zusätzlich die möglichen Häuser aufgezeigt. <br> Viel Spaß!";

	static final String OK_BUTTON = "OK";
	static final String PARAMETER_POSITVE_BUTTON = "positiver Parameter";
	static final String PARAMETER_NEGATIVE_BUTTON = "negativer Parameter";
	static final String START_BUTTON = "Gewählten Kartenausschnitt verwenden!";

	static final String BIG_MAP_TITLE = "Sehr großer Kartenausschnitt";
	static final String BIG_MAP_TEXT = "Dieser Kartenausschnitt ist sehr groß. Da die Berechnung sehr viel Zeit in Anspruch nehmen wird, empfiehlt es sich, einen genaueren Kartenausschnitt zu wählen.";
	static final String TAKE_MAP_NOT_BUTTON = "Anderen Ausschnitt wählen";
	static final String TAKE_MAP_BUTTON = "Trotzdem fortfahren";

	static final String NO_CONNECTION_TITLE = "Keine Internetverbindung";
	static final String NO_CONNECTION_TEXT = "Leider kann das Programm momentan keine Internetverbindung herstellen.<br> Bitte überprüfen Sie ihre Verbindung und versuchen es anschließend noch einmal!";

	static final String NO_CONNECTION_SERVER_TITLE = "Server überlastet";
	static final String NO_CONNECTION_SERVER_TEXT = "Leider ist der Server, der für die Datenbeschaffung genutzt wurd gegenwärtig überlastet. Dieses Problem tritt selten auf, kann aber vorkommen, <br>wenn gerade viele Leute diesen Dienst nutzen.<br>Bitte versuchen Sie es in ein paar Sekunden noch einmal!";

	static final String ADDRESS_NOT_FOUND_TITLE = "Adresse ungültig";
	static final String ADDRESS_NOT_FOUND_TEXT = "Die eingegebene Adresse konnte nicht gefunden werden! Bitte versuchen Sie es mit einer anderen Adresse oder überprüfen Sie Ihre Schreibweise!";

	static final String ADDRESS_RESULT_TITLE = "Gefundene Adressen";
	static final String ADDRESS_RESULT_TEXT = "Bitte wählen Sie eine der gefundenen Adressen aus!";

	static final String NO_TEXT_TITLE = "Leere Eingabe";
	static final String NO_TEXT_TEXT = "Bitte geben Sie einen Text in das passende Textfeld ein, bevor Sie auf \" Suchen \" klicken!";
	
	static final String[] LOADING_MAP = new String[] {
			"Karte wird heruntergeladen ... ", "Daten werden generiert ... ",
			"Karte wird erstellt ...", "Fertigstellen ... " };
	static final String[] LOADING_MATCH = new String[] {
			"Suchanfrage auswerten ... ", "Passe Suchanfrage an ...",
			"Hole Daten ... ", "Berechne ... ",
			"Finde Wohnobjekte/Regionen ... " };

	static final String WELCOME_TEXT = "Herzlich Willkommen bei BitMAPSearch! <br> Mit dieser Anwendung haben Sie die Möglichkeit, sich für die von Ihnen zuvor gewählten Parameter den idealen Wohnort anzeigen zu lassen. <br> Hierfür müssen Sie zunächst einen Kartenausschnitt auswählen (es empfiehlt sich keine zu ungenauen Ausschnitte zu verwenden) und auf den Button klicken, der den Kartenausschnitt generiert. <br> Anschließend können Sie Parameter auswählen, die Sich sich in der Nähe wünschen (z.B. Supermarkt, Bushaltestelle, etc.) und es wird der passende Wohnort berechnet.";
	static final String BACK_TO_MAP = "Zurück zur Karte";
	static final String NEW_PARAM = "neuer Parameter";
	static final String QUESTION = "?";
	static final String DELETE = "X";
	static final String SEARCH_START = "Suche!";

	static final String DISTANCE_SLIDER_TEXT_POS = "maximale Entfernung: ";
	static final String DISTANCE_SLIDER_TEXT_NEG = "minimale Entfernung: ";
	static final String IMPORTACNE_SLIDER_TEXT = "Wichtigkeit: ";

}
