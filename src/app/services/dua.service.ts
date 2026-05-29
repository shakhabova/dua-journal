import { Injectable, signal } from '@angular/core';
import type { Dua, UserDua } from '../models/dua.model';

@Injectable({
    providedIn: 'root',
})
export class DuaService {
    // Mock Data for library
    private libraryDuas: Dua[] = [
        {
            id: 'q1',
            source: 'Quran',
            textRu: 'Господь наш! Даруй нам благо в этом мире и благо в Последней жизни и защити нас от мучений в Огне.',
            textAr: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
            transcription:
                'Раббана атина фи-ддунья хасанатан ва филь-ахырати хасанатан ва кына ‘азабан-нар.',
            reference: '(Коран 2:201)',
        },
        {
            id: 'q2',
            source: 'Quran',
            textRu: 'Господи! Приумножь мои знания.',
            textAr: 'رَبِّ زِدْنِي عِلْمًا',
            transcription: "Рабби зидни 'илма(н).",
            reference: '(Коран 20:114)',
        },
        {
            id: 'q3',
            source: 'Quran',
            textRu: 'Господи! Раскрой для меня мою грудь. Облегчи мою миссию.',
            textAr: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي',
            transcription: 'Рабби-шрах ли садри ва яссир ли амри.',
            reference: '(Коран 20:25-26)',
        },
        {
            id: 'q4',
            source: 'Quran',
            textRu: 'Господи! Помилуй их, ведь они растили меня ребенком.',
            textAr: 'رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
            transcription: 'Рабби-рхамһума кяма раббаяни сагира(н).',
            reference: '(Коран 17:24)',
        },
        {
            id: 's1',
            source: 'Sunnah',
            textRu: 'О Аллах, направь мое сердце и улучши мои дела.',
            textAr: 'اللَّهُمَّ اهْدِ قَلْبِي وَأَصْلِحْ ذَاتَ بَيْنِنَا',
            transcription: 'Аллахумма-хди калби ва аслих зата байнина.',
            reference: 'Муслим',
        },
        {
            id: 's2',
            source: 'Sunnah',
            textRu: 'О Аллах, я прошу у Тебя полезного знания, благого удела и такого дела, которое будет принято.',
            textAr: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلاً مُتَقَبَّلاً',
            transcription:
                "Аллахумма инни ас'алюка ‘ильман нафи‘ан, ва ризкан таййибан, ва ‘амалян мутакаббалян.",
            reference: 'Ибн Маджа',
        },
        {
            id: 's3',
            source: 'Sunnah',
            textRu: 'О Аллах! Ты – Тот, Кто меняет наши сердца, так укрепи же мое сердце в Твоей религии. О Аллах! Ты меняешь наши сердца, так сделай же наши сердца послушными тебе.',
            textAr: 'يَا مُقَلِبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِك،َ عَلَى طَاعَتِكَ اللَّهُمَّ مُصَرِّفَ القُلُوبِ صَرِّفُ قُلُوبَنَا',
            transcription:
                "Йа Муқаллиба-ль-кулюби сяббит қальби 'аля диник(а). Аллаһумма мусаррифа-ль-кулюби сарриф қулюбана аля та'атик (а).",
            reference: 'Тирмизи, Ибн Маджа',
        },
        {
            id: 's4',
            source: 'Sunnah',
            textRu: 'О Аллах! Прости мне грех мой, и сделай дом мой просторным, и сделай удел мой благодатным.',
            textAr: 'اللَّهُمَّ اغْفِرْ لِي ذَنْبِي، وَوَسِّعْ لِي فِي دَارِي، وَبَارِكْ لِي فِيمَا رَزَقْتَنِي',
            transcription:
                'Аллаһумма-гфир ли занби, ва васси ли фи дари, ва барик ли фима разақтани.',
            reference: 'Тирмизи',
        },
        {
            id: 's5',
            source: 'Sunnah',
            textRu: 'О Аллах! Сделай знание, которому Ты меня научил, полезным для меня и научи меня тому, что принесет мне пользу, и приумножь мои знания.',
            textAr: 'اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي وَعَلَّمْنِي مَا يَنْفَعُنِي وَزِدْنِي عِلْمًا',
            transcription:
                "Аллаһумма-нфа'ни бима аллямтани ва аллимни ма янфа'унӣ ва зидни 'илма (н).",
            reference: 'Ибн Маджа',
        },
        {
            id: 's6',
            source: 'Sunnah',
            textRu: 'О Аллах! Поистине, я прибегаю к Твоей защите от слабости, и нерадения, малодушия, скупости и старческой дряхлости, жестокости, отвлечённости рассеянности, иметь большую семью и быть при этом бедным, унижения, и чтобы быть нуждающимся. И я прибегаю к Твоей защите от нищеты, неверия, нечестия, несчастия, лицемерия, позора и показухи. И прибегаю к Твоей защите от глухоты, немоты, безумия, лепры, проказы и прочих тяжких болезней.',
            textAr: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ العَجْزِ وَالكَسَل،ِ وَالجُبْنِ وَالبُخْل،ِ وَالهَرَمِ وَالقَسْوَة،ِ وَالغَفْلَةِ وَالعَيْلَة،َ وَالذِّلَّةِ وَالمَسْكَنَة،َ وَأَعُوذُ بِكَ مِنَ الفَقْرِ وَالكُفْر،ِ وَالفُسُوقِ وَالشَّقَاق،ِ وَالنِّفَاقِ وَالسُّمْعَة،ِ وَالرِّيَاء،ِ وَأَعُوذُ بِكَ مِنَ الصَّمَمِ وَالبَكَم، والجنون، والجذام،ِ والبَرَض،ِ وَسَيِّءِ الأَسْقَامِ',
            transcription:
                "Аллаһумма инни а'узу бика мина-ль-аджзи ва-ль-касяли, ва-ль-джубни ва-ль-бухли, ва-ль-һарами ва-ль-қасвати, ва-ль-гафляти ва-ль-айлята, ва-з-зиллята ва-ль-масканата, ва а'узу бика мина-ль-фақри ва-ль-куфри, ва-ль-фусуқи ва-ш-шиқақи, ва-н-нифақи ва-с-сум'ати, ва-р-рия'и, ва а'узу бика мина-с-самами ва-ль-баками, ва-ль-джунуни, ва-ль-джузами, ва-ль-бараси, ва саййи'и-ль-асқам(и).",
            reference: 'Аль-Хаким, Ат-Табарани',
        },
        {
            id: 'q5',
            source: 'Quran',
            textRu: 'Господи! Спаси меня от несправедливых людей.',
            textAr: 'رَبِّ نَجِّنِي مِنَ الْقَوْمِ الظَّالِمِينَ',
            transcription: 'Рабби наджини мина-ль-қавми-з-залимин(а).',
            reference: '(Коран 28:21)',
        },
    ];

    // Using signals for state
    public userDuas = signal<UserDua[]>([
        {
            id: 'u1',
            category: 'Ризк',
            text: 'Помоги мне найти новую работу, где я смогу приносить пользу',
            dateAdded: new Date(2025, 2, 11),
            isAnswered: false,
            isCustom: true,
        },
        {
            id: 'u2',
            category: 'Семья',
            text: 'Даруй моей маме крепкое здоровье и защити ее от вреда',
            dateAdded: new Date(2025, 0, 27),
            answeredAt: new Date(2025, 2, 11),
            answerNote: 'Альхамдулиллях, мама чувствует себя лучше.',
            isAnswered: true,
            isCustom: true,
        },
        {
            id: 'u3',
            category: 'Ризк',
            text: 'Облегчи мне это испытание и успокой мое сердце.',
            dateAdded: new Date(2025, 0, 22),
            isAnswered: false,
            isCustom: true,
        },
    ]);

    constructor() {}

    getLibraryDuas(): Dua[] {
        return this.libraryDuas;
    }

    getDailyDua(): Dua {
        // Just returning first one for mock
        return this.libraryDuas[0];
    }

    addUserDua(
        text: string,
        category: string = '',
        originalDuaId?: string,
        sourceDetails?: Pick<Dua, 'textAr' | 'transcription' | 'reference'>,
    ) {
        const newDua: UserDua = {
            id: 'u' + Date.now().toString(),
            text,
            textAr: sourceDetails?.textAr,
            transcription: sourceDetails?.transcription,
            reference: sourceDetails?.reference,
            category,
            dateAdded: new Date(),
            isAnswered: false,
            isCustom: true,
            originalDuaId,
        };
        this.userDuas.update((duas) => [newDua, ...duas]);
    }

    markAsAnswered(id: string) {
        this.userDuas.update((duas) =>
            duas.map((dua) =>
                dua.id === id
                    ? {
                          ...dua,
                          isAnswered: true,
                          answeredAt: dua.answeredAt ?? new Date(),
                      }
                    : dua,
            ),
        );
    }

    unmarkAsAnswered(id: string) {
        this.userDuas.update((duas) =>
            duas.map((dua) =>
                dua.id === id
                    ? { ...dua, isAnswered: false, answeredAt: undefined }
                    : dua,
            ),
        );
    }

    updateUserDua(id: string, text: string, category: string) {
        this.userDuas.update((duas) =>
            duas.map((dua) =>
                dua.id === id ? { ...dua, text, category } : dua,
            ),
        );
    }

    updateAnswerNote(id: string, answerNote: string) {
        this.userDuas.update((duas) =>
            duas.map((dua) => (dua.id === id ? { ...dua, answerNote } : dua)),
        );
    }

    deleteUserDua(id: string) {
        this.userDuas.update((duas) => duas.filter((dua) => dua.id !== id));
    }
}
